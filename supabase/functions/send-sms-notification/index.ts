import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 SMS per minute
const RATE_LIMIT_WINDOW_SECONDS = 60;

// Zod schema for input validation with enum for status
const OrderStatusEnum = z.enum([
  'placed', 'accepted', 'preparing', 'ready', 'collected', 'cancelled'
]);

const SendSMSSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  status: OrderStatusEnum
});

// Generic error responses - hide internal details from clients
const ERROR_RESPONSES = {
  INVALID_REQUEST: { error: 'Invalid request' },
  UNAUTHORIZED: { error: 'Unauthorized' },
  FORBIDDEN: { error: 'Forbidden' },
  RATE_LIMITED: { error: 'Too many requests. Please try again later.' },
  SERVICE_UNAVAILABLE: { error: 'Service temporarily unavailable' },
  OPERATION_FAILED: { error: 'Operation failed' }
} as const;

function errorResponse(type: keyof typeof ERROR_RESPONSES, status: number, requestId: string) {
  return new Response(
    JSON.stringify({ ...ERROR_RESPONSES[type], requestId }),
    { status, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Sanitize text for SMS messages
function sanitizeForSMS(text: string): string {
  return text
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 160); // SMS length limit
}

// Audit logging helper
async function logAuditEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  event: {
    event_type: string;
    user_id: string | null;
    resource_type: string;
    resource_id: string;
    action: string;
    status: string;
    ip_address: string | null;
    user_agent: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await supabase.from("audit_logs").insert(event);
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error(`[${requestId}] Missing authorization header`);
      return errorResponse('UNAUTHORIZED', 401, requestId);
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error(`[${requestId}] Auth error:`, authError);
      return errorResponse('UNAUTHORIZED', 401, requestId);
    }

    // Verify caller has canteen_owner or admin role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !["canteen_owner", "admin"].includes(roleData.role)) {
      console.error(`[${requestId}] Insufficient permissions for user ${user.id}`);
      return errorResponse('FORBIDDEN', 403, requestId);
    }

    // Check rate limit
    const { data: rateLimitOk } = await supabaseAdmin.rpc('check_rate_limit', {
      p_identifier: user.id,
      p_endpoint: 'send-sms-notification',
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS
    });

    if (!rateLimitOk) {
      console.error(`[${requestId}] Rate limit exceeded for user ${user.id}`);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'notification',
        user_id: user.id,
        resource_type: 'sms',
        resource_id: requestId,
        action: 'send_sms',
        status: 'rate_limited',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId }
      });
      return errorResponse('RATE_LIMITED', 429, requestId);
    }

    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error(`[${requestId}] Missing Twilio credentials`);
      return errorResponse('SERVICE_UNAVAILABLE', 503, requestId);
    }

    // Parse and validate input with Zod
    let validatedInput;
    try {
      const rawBody = await req.json();
      validatedInput = SendSMSSchema.parse(rawBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error(`[${requestId}] Validation error:`, validationError.errors);
        return errorResponse('INVALID_REQUEST', 400, requestId);
      }
      throw validationError;
    }

    const { orderId, status } = validatedInput;

    // Get order details with user profile
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        token_number,
        user_id,
        time_slots (start_time, end_time)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(`[${requestId}] Order fetch error:`, orderError);
      // Return success to prevent order enumeration
      return new Response(
        JSON.stringify({ success: true, sent: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profile with phone
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("name, phone")
      .eq("user_id", order.user_id)
      .single();

    if (profileError || !profile || !profile.phone) {
      console.error(`[${requestId}] Cannot send SMS: no phone for user ${order.user_id}`);
      // Return success to prevent user enumeration
      return new Response(
        JSON.stringify({ success: true, sent: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format phone number (ensure it has country code)
    let phone = profile.phone.replace(/\s/g, "");
    if (!phone.startsWith("+")) {
      phone = "+91" + phone; // Default to India
    }

    // Create message based on status (using validated enum value)
    const tokenNumber = order.token_number;
    const timeSlot = order.time_slots as unknown as { start_time: string; end_time: string } | null;
    
    const statusMessages: Record<z.infer<typeof OrderStatusEnum>, string> = {
      placed: `CampusBite: Your order #${tokenNumber} has been placed successfully.`,
      accepted: `CampusBite: Your order #${tokenNumber} has been accepted! We'll notify you when it's ready.`,
      preparing: `CampusBite: Your order #${tokenNumber} is now being prepared!`,
      ready: `CampusBite: Your order #${tokenNumber} is READY for pickup! Pickup: ${timeSlot?.start_time || 'ASAP'} - ${timeSlot?.end_time || ''}`,
      cancelled: `CampusBite: Your order #${tokenNumber} has been cancelled. Contact canteen for refund.`,
      collected: `CampusBite: Thank you! Order #${tokenNumber} has been collected.`
    };

    const message = sanitizeForSMS(statusMessages[status]);

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
      body: new URLSearchParams({
        To: phone,
        From: TWILIO_PHONE_NUMBER,
        Body: message,
      }),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error(`[${requestId}] Twilio error:`, twilioResult);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'notification',
        user_id: user.id,
        resource_type: 'sms',
        resource_id: orderId,
        action: 'send_sms',
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId, orderStatus: status }
      });
      return errorResponse('OPERATION_FAILED', 500, requestId);
    }

    console.log(`[${requestId}] SMS sent successfully: ${twilioResult.sid}`);

    // Log the notification
    const { error: logError } = await supabaseAdmin.from("sms_notifications").insert({
      order_id: orderId,
      phone: phone,
      message: message,
      status: "sent",
      twilio_sid: twilioResult.sid,
    });

    if (logError) {
      console.error(`[${requestId}] SMS log error:`, logError);
    }

    // Audit log success
    await logAuditEvent(supabaseAdmin, {
      event_type: 'notification',
      user_id: user.id,
      resource_type: 'sms',
      resource_id: orderId,
      action: 'send_sms',
      status: 'success',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { requestId, orderStatus: status, twilioSid: twilioResult.sid }
    });

    return new Response(
      JSON.stringify({ success: true, sent: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return errorResponse('OPERATION_FAILED', 500, requestId);
  }
};

serve(handler);