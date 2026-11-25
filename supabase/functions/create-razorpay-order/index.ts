import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 payment attempts
const RATE_LIMIT_WINDOW_SECONDS = 60; // Per minute

// Zod schema for input validation
const CreateOrderSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(100000, 'Amount exceeds maximum limit')
    .refine(n => Number.isFinite(n), 'Invalid amount')
});

// Generic error responses - hide internal details from clients
const ERROR_RESPONSES = {
  INVALID_REQUEST: { error: 'Invalid request' },
  UNAUTHORIZED: { error: 'Unauthorized' },
  FORBIDDEN: { error: 'Forbidden' },
  NOT_FOUND: { error: 'Not found' },
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

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let userId: string | null = null;
  let orderId: string | null = null;

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

    userId = user.id;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const { data: rateLimitOk } = await supabaseAdmin.rpc('check_rate_limit', {
      p_identifier: user.id,
      p_endpoint: 'create-razorpay-order',
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
        action: 'create_order',
        status: 'rate_limited',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId }
      });
      return errorResponse('RATE_LIMITED', 429, requestId);
    }

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error(`[${requestId}] Missing Razorpay credentials`);
      return errorResponse('SERVICE_UNAVAILABLE', 503, requestId);
    }

    // Parse and validate input with Zod
    let validatedInput;
    try {
      const rawBody = await req.json();
      validatedInput = CreateOrderSchema.parse(rawBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error(`[${requestId}] Validation error:`, validationError.errors);
        return errorResponse('INVALID_REQUEST', 400, requestId);
      }
      throw validationError;
    }

    const { amount } = validatedInput;
    orderId = validatedInput.orderId;

    // Verify user owns the order and amount matches
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("user_id, total_amount")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(`[${requestId}] Order not found:`, orderId);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'payment',
        user_id: user.id,
        resource_type: 'order',
        resource_id: orderId,
        action: 'create_order',
        status: 'not_found',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId }
      });
      return errorResponse('FORBIDDEN', 403, requestId);
    }

    if (order.user_id !== user.id) {
      console.error(`[${requestId}] User ${user.id} attempted to access order ${orderId} owned by ${order.user_id}`);
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

    // Verify amount matches order total (within tolerance for floating point)
    if (Math.abs(order.total_amount - amount) > 0.01) {
      console.error(`[${requestId}] Amount mismatch: expected ${order.total_amount}, got ${amount}`);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'security',
        user_id: user.id,
        resource_type: 'order',
        resource_id: orderId,
        action: 'amount_mismatch',
        status: 'blocked',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId, expected: order.total_amount, received: amount }
      });
      return errorResponse('INVALID_REQUEST', 400, requestId);
    }

    // Create Razorpay order
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: "INR",
        receipt: orderId,
        notes: {
          order_id: orderId,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text();
      console.error(`[${requestId}] Razorpay API error:`, errorData);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'payment',
        user_id: user.id,
        resource_type: 'order',
        resource_id: orderId,
        action: 'create_order',
        status: 'gateway_error',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { requestId }
      });
      return errorResponse('OPERATION_FAILED', 500, requestId);
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log(`[${requestId}] Razorpay order created:`, razorpayOrder.id);

    // Store payment record in database
    const { error: dbError } = await supabaseAdmin.from("payments").insert({
      order_id: orderId,
      razorpay_order_id: razorpayOrder.id,
      amount: amount,
      currency: "INR",
      status: "pending",
    });

    if (dbError) {
      console.error(`[${requestId}] Database error:`, dbError);
      return errorResponse('OPERATION_FAILED', 500, requestId);
    }

    // Log successful payment order creation
    await logAuditEvent(supabaseAdmin, {
      event_type: 'payment',
      user_id: user.id,
      resource_type: 'payment',
      resource_id: razorpayOrder.id,
      action: 'create_order',
      status: 'success',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { requestId, orderId, amount }
    });

    return new Response(
      JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: RAZORPAY_KEY_ID,
      }),
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