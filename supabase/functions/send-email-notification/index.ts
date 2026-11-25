import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 emails per minute
const RATE_LIMIT_WINDOW_SECONDS = 60;

// Zod schema for input validation with enum for status
const OrderStatusEnum = z.enum([
  'placed', 'accepted', 'preparing', 'ready', 'collected', 'cancelled'
]);

const SendEmailSchema = z.object({
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

// Escape HTML to prevent XSS in email content
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error(`[${requestId}] Missing Resend API key`);
      return errorResponse('SERVICE_UNAVAILABLE', 503, requestId);
    }

    const resend = new Resend(resendApiKey);

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
      p_endpoint: 'send-email-notification',
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS
    });

    if (!rateLimitOk) {
      console.error(`[${requestId}] Rate limit exceeded for user ${user.id}`);
      await logAuditEvent(supabaseAdmin, {
        event_type: 'notification',
        user_id: user.id,
        resource_type: 'email',
        resource_id: requestId,
        action: 'send_email',
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
      const rawBody = await req.json();
      validatedInput = SendEmailSchema.parse(rawBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error(`[${requestId}] Validation error:`, validationError.errors);
        return errorResponse('INVALID_REQUEST', 400, requestId);
      }
      throw validationError;
    }

    const { orderId, status } = validatedInput;

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        token_number,
        total_amount,
        user_id,
        created_at,
        notes,
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

    // Get user email from auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    
    if (userError || !userData.user?.email) {
      console.error(`[${requestId}] Cannot send email: no email for user ${order.user_id}`);
      // Return success to prevent user enumeration
      return new Response(
        JSON.stringify({ success: true, sent: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("user_id", order.user_id)
      .single();

    // Get order items
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select(`
        quantity,
        price_at_time,
        menu_items (name)
      `)
      .eq("order_id", orderId);

    const timeSlot = order.time_slots as unknown as { start_time: string; end_time: string } | null;
    const userName = escapeHtml(profile?.name || "Customer");
    const userEmail = userData.user.email;

    // Build email content based on validated status (using enum)
    const statusConfig: Record<z.infer<typeof OrderStatusEnum>, { subject: string; message: string; color: string }> = {
      placed: {
        subject: `Order #${order.token_number} Placed - CampusBite`,
        message: "Your order has been placed successfully. Please complete payment.",
        color: "#3b82f6"
      },
      accepted: {
        subject: `Order #${order.token_number} Confirmed - CampusBite`,
        message: "Your order has been accepted and will be prepared soon.",
        color: "#22c55e"
      },
      preparing: {
        subject: `Order #${order.token_number} Being Prepared - CampusBite`,
        message: "Your order is now being prepared by the canteen!",
        color: "#f97316"
      },
      ready: {
        subject: `🍽️ Order #${order.token_number} Ready for Pickup! - CampusBite`,
        message: "Your order is READY! Please collect it from the canteen counter.",
        color: "#22c55e"
      },
      cancelled: {
        subject: `Order #${order.token_number} Cancelled - CampusBite`,
        message: "Your order has been cancelled. Please contact the canteen for refund details.",
        color: "#ef4444"
      },
      collected: {
        subject: `Order #${order.token_number} Collected - CampusBite`,
        message: "Thank you for your order! We hope you enjoyed your meal.",
        color: "#6b7280"
      }
    };

    const { subject, message: statusMessage, color: statusColor } = statusConfig[status];

    // Build items list HTML with escaped content
    const itemsHtml = orderItems?.map(item => {
      const itemName = escapeHtml((item.menu_items as unknown as { name: string } | null)?.name || 'Item');
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${itemName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price_at_time}</td>
        </tr>
      `;
    }).join('') || '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🍽️ CampusBite</h1>
          </div>
          
          <!-- Token Number -->
          <div style="text-align: center; padding: 30px 20px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 16px; padding: 20px 40px;">
              <p style="color: white; margin: 0 0 5px 0; font-size: 14px;">TOKEN NUMBER</p>
              <p style="color: white; margin: 0; font-size: 48px; font-weight: bold;">#${order.token_number}</p>
            </div>
          </div>
          
          <!-- Status Badge -->
          <div style="text-align: center; padding: 0 20px 20px;">
            <div style="display: inline-block; background-color: ${statusColor}; color: white; padding: 10px 24px; border-radius: 20px; font-weight: 600;">
              ${status.toUpperCase()}
            </div>
          </div>
          
          <!-- Message -->
          <div style="padding: 0 30px 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
              Hi ${userName},<br><br>
              ${statusMessage}
            </p>
          </div>
          
          <!-- Order Details -->
          <div style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #eee;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 10px; text-align: left; font-weight: 600;">Item</th>
                  <th style="padding: 10px; text-align: center; font-weight: 600;">Qty</th>
                  <th style="padding: 10px; text-align: right; font-weight: 600;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px 8px; font-weight: bold;">Total</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #f97316;">₹${order.total_amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <!-- Pickup Info -->
          ${timeSlot ? `
          <div style="padding: 20px 30px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Pickup Time:</strong> ${escapeHtml(timeSlot.start_time)} - ${escapeHtml(timeSlot.end_time)}
            </p>
          </div>
          ` : ''}
          
          <!-- Footer -->
          <div style="padding: 20px 30px; background-color: #1f2937; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              CampusBite - Your Campus Food Pre-ordering System
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "CampusBite <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: emailHtml,
    });

    console.log(`[${requestId}] Email sent successfully:`, emailResponse);

    // Audit log success
    await logAuditEvent(supabaseAdmin, {
      event_type: 'notification',
      user_id: user.id,
      resource_type: 'email',
      resource_id: orderId,
      action: 'send_email',
      status: 'success',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { requestId, orderStatus: status, recipient: userEmail }
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