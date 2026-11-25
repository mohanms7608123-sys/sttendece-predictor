import { MenuItem } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Plus, Minus, Clock, Star, Heart, Sparkles, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMenuItemRatings } from '@/hooks/useRatings';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface MobileMenuCardProps {
  item: MenuItem;
  showControls?: boolean;
}

export function MobileMenuCard({ item, showControls = true }: MobileMenuCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const { data: ratingsData } = useMenuItemRatings();

  const [isLiked, setIsLiked] = useState(false);

  const cartItem = items.find(ci => ci.menuItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const itemRating = ratingsData?.[item.id];
  const displayRating = itemRating?.averageRating ? itemRating.averageRating.toFixed(1) : "4.8";

  const discount = 15;
  const originalPrice = Math.floor(item.price * (100 / (100 - discount)));

  return (
    <div className="px-4 mb-5">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] hover:shadow-[0_12px_32px_-6px_rgba(6,78,59,0.12)] transition-all duration-300">
          {/* HERO IMAGE SECTION */}
          <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-muted">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-[#D1FAE5]/40 flex items-center justify-center text-[#064E3B]/40">
                <UtensilsCrossed className="h-16 w-16" />
              </div>
            )}

            {/* Overlay Gradient at Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Top Row Badges: Veg/Non-Veg & Favourite */}
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md",
                item.is_veg !== false
                  ? "bg-[#D1FAE5] text-[#064E3B] border border-[#10B981]/40"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}>
                {item.is_veg !== false ? '🌱 Veg' : '🍖 Non-Veg'}
              </span>

              {item.category && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/40 backdrop-blur-md text-white border border-white/20">
                  {item.category}
                </span>
              )}
            </div>

            <div className="absolute top-3.5 right-3.5 z-10">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="h-9 w-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all text-white hover:bg-black/50 border border-white/20"
                aria-label="Add to favourites"
              >
                <Heart className={cn("h-4 w-4 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-white")} />
              </button>
            </div>

            {/* Bottom In-Image Info: Prep Time & Rating */}
            <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-xs font-semibold">
                <Clock className="h-3.5 w-3.5 text-[#10B981]" />
                <span>{item.prep_time} mins prep</span>
              </div>

              <div className="flex items-center gap-1 bg-[#D4AF37] text-[#1F2937] px-2.5 py-1 rounded-full text-xs font-black shadow-md">
                <Star className="h-3 w-3 fill-current" />
                <span>{displayRating}</span>
              </div>
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="p-4 sm:p-5 bg-card">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 pr-3">
                <h3 className="font-bold text-foreground text-lg sm:text-xl tracking-tight leading-snug line-clamp-1 font-display">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  Fresh campus kitchen preparation • Express pickup available
                </p>
              </div>
            </div>

            {/* PRICE & ADD BUTTON ROW */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/60">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground font-black text-2xl font-display">
                    ₹{item.price}
                  </span>
                  <span className="text-muted-foreground/60 text-xs line-through">
                    ₹{originalPrice}
                  </span>
                </div>
                <span className="text-[10px] text-[#10B981] font-bold">
                  Instant token upon order
                </span>
              </div>

              {showControls && (
                <div>
                  {quantity === 0 ? (
                    <Button
                      onClick={() => addItem(item)}
                      className="h-10 px-6 rounded-2xl bg-[#064E3B] hover:bg-[#054030] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_14px_rgba(6,78,59,0.25)] border border-[#D4AF37]/30 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#10B981]" />
                      <span>ADD</span>
                    </Button>
                  ) : (
                    <div className="flex items-center bg-[#D1FAE5] dark:bg-emerald-950/60 rounded-2xl h-10 p-1 border border-[#10B981]/30 shadow-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#064E3B] dark:text-emerald-300 hover:bg-white/60 dark:hover:bg-zinc-800 rounded-xl"
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="font-black text-sm text-[#064E3B] dark:text-emerald-300 px-3 min-w-[28px] text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#064E3B] dark:text-emerald-300 hover:bg-white/60 dark:hover:bg-zinc-800 rounded-xl"
                        onClick={() => addItem(item)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
