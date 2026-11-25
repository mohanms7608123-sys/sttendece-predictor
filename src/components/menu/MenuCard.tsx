import { MenuItem } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Plus, Minus, Clock, UtensilsCrossed, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarRating } from './StarRating';
import { useMenuItemRatings, useUserRatings, useSubmitRating } from '@/hooks/useRatings';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface MenuCardProps {
  item: MenuItem;
  showControls?: boolean;
}

export function MenuCard({ item, showControls = true }: MenuCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const { data: ratingsData } = useMenuItemRatings();
  const { data: userRatings } = useUserRatings();
  const submitRating = useSubmitRating();

  const cartItem = items.find(ci => ci.menuItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const itemRating = ratingsData?.[item.id];
  const userRating = userRatings?.[item.id] || 0;

  const handleRate = (rating: number) => {
    if (!user) return;
    submitRating.mutate({ menuItemId: item.id, rating });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] hover:shadow-[0_12px_32px_-6px_rgba(6,78,59,0.12)] transition-all duration-300",
        !item.is_available && "opacity-60"
      )}>
        <div>
          {/* Image Container */}
          <div className="relative aspect-[16/10] bg-muted overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#D1FAE5]/30">
                <UtensilsCrossed className="h-12 w-12 text-[#064E3B]/40" />
              </div>
            )}

            {!item.is_available && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                <Badge variant="destructive" className="text-xs font-bold uppercase tracking-wider px-3 py-1">
                  Sold Out
                </Badge>
              </div>
            )}

            {/* Badges on Image */}
            <div className="absolute top-3 left-3 z-10">
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md",
                item.is_veg !== false
                  ? "bg-[#D1FAE5] text-[#064E3B] border border-[#10B981]/40"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}>
                {item.is_veg !== false ? '🌱 Veg' : '🍖 Non-Veg'}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#064E3B]/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
              <Clock className="h-3 w-3 text-[#10B981]" />
              {item.prep_time} min
            </div>
          </div>

          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-foreground truncate font-display">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.category || 'Special'}</p>
              </div>
              <p className="font-display text-xl font-black text-[#064E3B] dark:text-emerald-400">
                ₹{item.price}
              </p>
            </div>

            {/* Star Rating Section */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <StarRating
                  rating={itemRating?.averageRating || 0}
                  size="sm"
                  readonly
                  showValue
                  totalRatings={itemRating?.totalRatings}
                />
              </div>
            </div>

            {/* User Rating Input */}
            {user && (
              <div className="mt-2.5 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium">Your rating:</span>
                  <StarRating
                    rating={userRating}
                    size="sm"
                    onRate={handleRate}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </div>

        {/* Footer Add to Cart Controls */}
        <div className="p-4 sm:p-5 pt-0">
          {showControls && item.is_available && (
            <div>
              {quantity === 0 ? (
                <Button
                  onClick={() => addItem(item)}
                  className="w-full bg-[#064E3B] hover:bg-[#054030] text-white font-bold text-xs h-10 rounded-2xl shadow-sm border border-[#D4AF37]/30 transition-all active:scale-95"
                  size="sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1 text-[#10B981]" />
                  Add to Order
                </Button>
              ) : (
                <div className="flex items-center justify-between bg-[#D1FAE5] dark:bg-emerald-950/60 rounded-2xl p-1 border border-[#10B981]/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#064E3B] dark:text-emerald-300 hover:bg-white/60 dark:hover:bg-zinc-800 rounded-xl"
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="font-black text-sm text-[#064E3B] dark:text-emerald-300">{quantity}</span>
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
      </Card>
    </motion.div>
  );
}
