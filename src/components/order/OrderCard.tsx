import { OrderWithDetails } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { Clock, ChevronRight, CheckCircle2, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OrderCardProps {
  order: OrderWithDetails;
  showReorder?: boolean;
}

export function OrderCard({ order }: OrderCardProps) {
  const orderDate = new Date(order.created_at);
  const activeStatus = ['placed', 'accepted', 'preparing', 'ready'];
  const isActive = activeStatus.includes(order.status);

  const steps = ['placed', 'preparing', 'ready', 'collected'];
  const currentStepIndex = steps.indexOf(order.status === 'accepted' ? 'placed' : order.status);
  const progressPercent = Math.max(0, Math.min(100, (currentStepIndex / (steps.length - 1)) * 100));

  return (
    <Link to={`/order/${order.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="group relative"
      >
        {/* Glow halo for active orders */}
        {isActive && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#064E3B] to-[#10B981] rounded-3xl opacity-30 blur-md group-hover:opacity-60 transition duration-500" />
        )}

        <Card className={cn(
          "relative overflow-hidden border border-border/80 rounded-3xl transition-all duration-300",
          "bg-card hover:border-[#10B981]/40 shadow-sm hover:shadow-xl",
          "mask-receipt pb-2"
        )}>
          {/* Top Brand Accent Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#064E3B] via-[#10B981] to-[#D4AF37]" />

          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              {/* Token Display Header */}
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" /> DIGITAL TOKEN
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-display font-black text-[#064E3B] dark:text-emerald-300 tracking-tight">
                    #{order.token_number}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={order.status} className="shadow-sm" />
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                  <Clock className="h-3 w-3 text-[#10B981]" />
                  {format(orderDate, 'h:mm a')}
                </div>
              </div>
            </div>

            {/* Receipt Notch Divider */}
            <div className="my-4 border-t-2 border-dashed border-border/70 relative">
              <div className="absolute -left-[26px] -top-2.5 w-5 h-5 bg-background rounded-full border border-border/50"></div>
              <div className="absolute -right-[26px] -top-2.5 w-5 h-5 bg-background rounded-full border border-border/50"></div>
            </div>

            {/* Items Summary */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <p className="text-sm text-foreground font-bold line-clamp-1 font-display">
                  {order.order_items?.map(item =>
                    `${item.quantity} × ${item.menu_item?.name || 'Item'}`
                  ).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {order.order_items?.length || 1} items • Reference #{order.id.slice(0, 6)}
                </p>
              </div>

              <div className="bg-[#D1FAE5]/50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-xl border border-[#10B981]/20">
                <p className="font-display font-black text-[#064E3B] dark:text-emerald-300 text-lg">
                  ₹{order.total_amount}
                </p>
              </div>
            </div>

            {/* Progress Bar for Active Orders */}
            {isActive && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="bg-muted h-2 rounded-full w-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#064E3B] to-[#10B981] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-bold text-muted-foreground">
                  <span className={order.status === 'placed' ? 'text-[#064E3B] font-black' : ''}>Placed</span>
                  <span className={order.status === 'preparing' ? 'text-[#D4AF37] font-black' : ''}>Preparing</span>
                  <span className={order.status === 'ready' ? 'text-[#10B981] font-black' : ''}>Ready for Counter</span>
                </div>
              </div>
            )}

            {isActive && order.status === 'ready' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-3 bg-[#D1FAE5] dark:bg-emerald-950/60 border border-[#10B981]/40 rounded-xl p-2.5 text-center"
              >
                <p className="text-xs font-bold text-[#065F46] dark:text-emerald-300 flex items-center justify-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  Food Ready! Present Token #{order.token_number} at counter.
                </p>
              </motion.div>
            )}
          </CardContent>

          <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0 duration-300" />
        </Card>
      </motion.div>
    </Link>
  );
}
