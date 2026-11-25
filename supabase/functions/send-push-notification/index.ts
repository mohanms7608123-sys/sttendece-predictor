import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 50; // Max 50 push notifications per minute
const RATE_LIMIT_WINDOW_SECONDS = 60;

// Zod schemas for input validation
const GetVapidKeySchema = z.object({
  action: z.literal('get-vapid-key')
});

const OrderStatusEnum = z.enum([
  'placed', 'accepted', 'preparing', 'ready', 'collected', 'cancelled'
]);

const SendNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  orderId: z.string().uuid('Invalid order ID'),
  status: OrderStatusEnum,
  tokenNumber: z.number()
    .int('Token must be integer')
    .positive('Invalid token number')
    .max(99999, 'Token number too large')
});

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

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

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  try {
    // Use web-push compatible approach with fetch
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return false;
    }

    // For web push, we need to use the web-push library
    // Since Deno doesn't have native web-push, we'll use a simplified approach
    // This sends a POST to the push service endpoint
    
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Push failed: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log("Push notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

serve(async (req) => {
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

    const body = await req.json();
    
    // Handle VAPID key request - this can be public (no auth required)
    const vapidKeyResult = GetVapidKeySchema.safeParse(body);
    if (vapidKeyResult.success) {
      const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
      if (!vapidPublicKey) {
        console.error(`[${requestId}] VAPID public key not configured`);
        return errorResponse('SERVICE_UNAVAILABLE', 503, requestId);
      }
      return new Response(
        JSON.stringify({ vapidPublicKey }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // For sending notifications, require authentication
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
      p_endpoint: 'send-push-notification',
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS
    });

    if (!rateLimitOk) {
      console.error(`[${requestId}] Rate limit exceeded for user ${user.id}`);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'notification',
        user_id: user.id,
        resource_type: 'push',
        resource_id: requestId,
        action: 'send_push',
        status: 'rate_limited',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId }
      });
      return errorResponse('RATE_LIMITED', 429, requestId);
    }

    // Parse and validate input with Zod
    let validatedInput;
    try {
      validatedInput = SendNotificationSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error(`[${requestId}] Validation error:`, validationError.errors);
        return errorResponse('INVALID_REQUEST', 400, requestId);
      }
      throw validationError;
    }

    const { userId, orderId, status, tokenNumber } = validatedInput;

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (subError) {
      console.error(`[${requestId}] Error fetching subscriptions:`, subError);
      return errorResponse('OPERATION_FAILED', 500, requestId);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[${requestId}] No push subscriptions found for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, message: "No subscriptions found", sent: 0, total: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build notification message using validated status enum
    const statusMessages: Record<z.infer<typeof OrderStatusEnum>, string> = {
      placed: "Your order has been placed!",
      accepted: "Your order has been accepted!",
      preparing: "Your order is being prepared",
      ready: "🔔 Your order is READY for pickup!",
      collected: "Order collected. Thank you!",
      cancelled: "Your order has been cancelled",
    };

    const payload: PushPayload = {
      title: `Order #${tokenNumber}`,
      body: statusMessages[status],
      url: `/order/${orderId}`,
    };

    // Send to all subscriptions
    let successCount = 0;
    for (const sub of subscriptions) {
      const success = await sendPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      );
      if (success) successCount++;
    }

    console.log(`[${requestId}] Sent ${successCount}/${subscriptions.length} push notifications`);

    // Audit log
    await logAuditEvent(supabaseAdmin, {
      event_type: 'notification',
      user_id: user.id,
      resource_type: 'push',
      resource_id: orderId,
      action: 'send_push',
      status: successCount > 0 ? 'success' : 'failed',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { requestId, orderStatus: status, sent: successCount, total: subscriptions.length }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        total: subscriptions.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return errorResponse('OPERATION_FAILED', 500, requestId);
  }
});