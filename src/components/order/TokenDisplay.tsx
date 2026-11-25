import { Order } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { Sparkles, CheckCircle2, Clock, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenDisplayProps {
  order: Order;
  showQR?: boolean;
}

export function TokenDisplay({ order, showQR = true }: TokenDisplayProps) {
  const qrValue = JSON.stringify({
    orderId: order.id,
    token: order.token_number,
    date: new Date(order.created_at).toISOString().split('T')[0]
  });

  return (
    <Card className={cn(
      "text-center overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg",
      order.status === 'ready' && "ring-2 ring-[#10B981] shadow-2xl"
    )}>
      {/* Token Header Banner */}
      <div className="bg-gradient-to-br from-[#064E3B] via-[#056046] to-[#10B981] py-8 px-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#D4AF37] text-xs font-bold mb-2 border border-white/10">
            <Sparkles className="h-3 w-3" />
            <span>OFFICIAL COLLECTION PASS</span>
          </div>

          <p className="font-display font-black text-6xl tracking-tight text-white drop-shadow-md">
            #{order.token_number.toString().padStart(3, '0')}
          </p>
          <p className="text-white/80 text-xs mt-1 font-medium">
            Present this number or QR code at pickup
          </p>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6 space-y-5">
        <div className="flex justify-center">
          <StatusBadge status={order.status} size="lg" />
        </div>

        {showQR && (
          <div className="flex justify-center p-4 bg-white rounded-2xl mx-auto max-w-[200px] shadow-sm border border-border/60">
            <QRCodeSVG
              value={qrValue}
              size={150}
              level="H"
              includeMargin={false}
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground font-mono">
          Ref ID: {order.id.slice(0, 12)}
        </p>

        {order.status === 'ready' && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-4 bg-[#D1FAE5] dark:bg-emerald-950/60 rounded-2xl border border-[#10B981]/40"
          >
            <p className="text-[#065F46] dark:text-emerald-300 font-bold text-base flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
              🎉 Ready for Immediate Pickup!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Proceed to the express counter now.
            </p>
          </motion.div>
        )}

        {order.status === 'preparing' && (
          <div className="p-4 bg-[#FFFBEB] dark:bg-amber-950/40 rounded-2xl border border-[#D4AF37]/40">
            <p className="text-[#92400E] dark:text-amber-300 font-bold text-sm flex items-center justify-center gap-2">
              <ChefHat className="h-4 w-4 text-[#D4AF37]" />
              👨‍🍳 Freshly Cooking in Kitchen
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated wait: 5-8 minutes
            </p>
          </div>
        )}

        {order.status === 'placed' && (
          <div className="p-4 bg-[#F3F4F6] dark:bg-zinc-800 rounded-2xl border border-border">
            <p className="text-foreground font-semibold text-sm flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-[#10B981]" />
              ⏳ Order Received by Kitchen
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Preparing your slot allocation...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
