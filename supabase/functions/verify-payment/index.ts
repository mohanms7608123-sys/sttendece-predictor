import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 verification attempts
const RATE_LIMIT_WINDOW_SECONDS = 60; // Per minute

// Zod schema for input validation
const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string()
    .min(10, 'Invalid order ID')
    .max(100, 'Order ID too long')
    .regex(/^order_[A-Za-z0-9]+$/, 'Invalid Razorpay order ID format'),
  razorpay_payment_id: z.string()
    .min(10, 'Invalid payment ID')
    .max(100, 'Payment ID too long')
    .regex(/^pay_[A-Za-z0-9]+$/, 'Invalid Razorpay payment ID format'),
  razorpay_signature: z.string()
    .min(60, 'Invalid signature')
    .max(70, 'Invalid signature'),
  orderId: z.string().uuid('Invalid order ID format')
});

// Generic error responses - hide internal details from clients
const ERROR_RESPONSES = {
  INVALID_REQUEST: { error: 'Invalid request', verified: false },
  UNAUTHORIZED: { error: 'Unauthorized', verified: false },
  FORBIDDEN: { error: 'Forbidden', verified: false },
  RATE_LIMITED: { error: 'Too many requests. Please try again later.', verified: false },
  SERVICE_UNAVAILABLE: { error: 'Service temporarily unavailable', verified: false },
  OPERATION_FAILED: { error: 'Operation failed', verified: false },
  VERIFICATION_FAILED: { error: 'Payment verification failed', verified: false }
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const { data: rateLimitOk } = await supabaseAdmin.rpc('check_rate_limit', {
      p_identifier: user.id,
      p_endpoint: 'verify-payment',
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS
    });

    if (!rateLimitOk) {
      console.error(`[${requestId}] Rate limit exceeded for user ${user.id}`);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'payment',
        user_id: user.id,
        resource_type: 'payment',
        resource_id: requestId,
        action: 'verify_payment',
        status: 'rate_limited',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId }
      });
      return errorResponse('RATE_LIMITED', 429, requestId);
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_SECRET) {
      console.error(`[${requestId}] Missing Razorpay credentials`);
      return errorResponse('SERVICE_UNAVAILABLE', 503, requestId);
    }

    // Parse and validate input with Zod
    let validatedInput;
    try {
      const rawBody = await req.json();
      validatedInput = VerifyPaymentSchema.parse(rawBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error(`[${requestId}] Validation error:`, validationError.errors);
        return errorResponse('INVALID_REQUEST', 400, requestId);
      }
      throw validationError;
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = validatedInput;

    // Verify user owns the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(`[${requestId}] Order not found:`, orderId);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'payment',
        user_id: user.id,
        resource_type: 'order',
        resource_id: orderId,
        action: 'verify_payment',
        status: 'not_found',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId }
      });
      return errorResponse('FORBIDDEN', 403, requestId);
    }

    if (order.user_id !== user.id) {
      console.error(`[${requestId}] User ${user.id} attempted to verify payment for order ${orderId} owned by ${order.user_id}`);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'security',
        user_id: user.id,
        resource_type: 'order',
        resource_id: orderId,
        action: 'unauthorized_access',
        status: 'blocked',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId, actual_owner: order.user_id }
      });
      return errorResponse('FORBIDDEN', 403, requestId);
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const encoder = new TextEncoder();
    const key = encoder.encode(RAZORPAY_KEY_SECRET);
    const message = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error(`[${requestId}] Invalid payment signature for order ${orderId}`);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'security',
        user_id: user.id,
        resource_type: 'payment',
        resource_id: razorpay_payment_id,
        action: 'verify_payment',
        status: 'invalid_signature',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId, orderId, razorpay_order_id }
      });
      return errorResponse('VERIFICATION_FAILED', 400, requestId);
    }

    // Update payment record
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "completed",
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (paymentError) {
      console.error(`[${requestId}] Payment update error:`, paymentError);
      return errorResponse('OPERATION_FAILED', 500, requestId);
    }

    // Update order status to accepted (payment confirmed)
    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({ status: "accepted" })
      .eq("id", orderId);

    if (orderUpdateError) {
      console.error(`[${requestId}] Order update error:`, orderUpdateError);
      // Don't fail the request - payment was verified successfully
    }

    // Log successful payment verification
    await logAuditEvent(supabaseAdmin, {
      event_type: 'payment',
      user_id: user.id,
      resource_type: 'payment',
      resource_id: razorpay_payment_id,
      action: 'verify_payment',
      status: 'success',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { requestId, orderId, razorpay_order_id }
    });

    console.log(`[${requestId}] Payment verified successfully: ${razorpay_payment_id}`);

    return new Response(
      JSON.stringify({ verified: true, message: "Payment verified successfully" }),
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