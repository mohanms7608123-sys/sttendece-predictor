import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StickyCartBarProps {
  className?: string;
}

export function StickyCartBar({ className }: StickyCartBarProps) {
  const { totalItems, totalAmount } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto sm:hidden",
        className
      )}
    >
      <Button
        onClick={() => navigate('/cart')}
        className="w-full h-15 bg-gradient-to-r from-[#064E3B] via-[#056046] to-[#10B981] hover:from-[#054030] hover:to-[#0d9668] text-white border border-[#D4AF37]/40 rounded-2xl shadow-[0_10px_30px_rgba(6,78,59,0.35)] flex items-center justify-between px-5 transition-all active:scale-[0.98]"
      >
        <div className="flex flex-col items-start leading-none gap-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
              {totalItems} {totalItems > 1 ? 'ITEMS' : 'ITEM'} IN TRAY
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 font-display font-black text-xl text-white">
            ₹{totalAmount.toFixed(0)}
            <span className="text-[10px] font-medium text-white/80">inclusive of taxes</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold border border-white/20">
          <span>Checkout</span>
          <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
        </div>
      </Button>
    </motion.div>
  );
}
