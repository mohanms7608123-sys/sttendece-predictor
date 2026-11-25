import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useCreateOrder } from '@/hooks/useOrders';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { usePayment } from '@/hooks/usePayment';
import { Minus, Plus, Trash2, Clock, ShoppingBag, Loader2, CreditCard, UtensilsCrossed, ShieldCheck, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Cart() {
  const { user, profile, loading: authLoading } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, totalAmount, estimatedPrepTime } = useCart();
  const { data: timeSlots, isLoading: slotsLoading } = useTimeSlots(true);
  const { data: settings } = useSystemSettings();
  const createOrder = useCreateOrder();
  const { initiatePayment } = usePayment();
  const navigate = useNavigate();

  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (timeSlots?.length && !selectedSlot) {
      const availableSlot = timeSlots.find(s =>
        s.is_active && s.current_orders < s.max_orders
      );
      if (availableSlot) {
        setSelectedSlot(availableSlot.id);
      }
    }
  }, [timeSlots, selectedSlot]);

  const orderingEnabled = settings?.ordering_enabled === 'true';

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a pickup time slot');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const order = await createOrder.mutateAsync({
        userId: user.id,
        timeSlotId: selectedSlot,
        items,
        totalAmount,
        notes: notes.trim() || undefined
      });

      initiatePayment({
        orderId: order.id,
        amount: totalAmount,
        userEmail: user.email || '',
        userName: profile?.name || 'Customer',
        userPhone: profile?.phone || undefined,
        onSuccess: () => {
          clearCart();
          navigate(`/order/${order.id}`);
        },
        onFailure: () => {
          setIsProcessing(false);
          toast.info('Payment incomplete. You can complete payment from your orders.');
        }
      });
    } catch (error) {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout headerTitle="Checkout Tray">
        <div className="flex flex-col items-center justify-center px-6 py-20 max-w-md mx-auto text-center">
          <div className="h-24 w-24 rounded-3xl bg-[#D1FAE5] dark:bg-emerald-950/60 flex items-center justify-center mb-6 shadow-sm border border-[#10B981]/20">
            <ShoppingBag className="h-12 w-12 text-[#064E3B] dark:text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground mb-2">
            Your tray is empty
          </h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Select gourmet dishes and freshly prepared meals from our campus menu.
          </p>
          <Button
            onClick={() => navigate('/menu')}
            className="h-12 px-8 bg-[#064E3B] hover:bg-[#054030] text-white rounded-2xl text-sm font-bold shadow-md border border-[#D4AF37]/30"
          >
            <UtensilsCrossed className="h-4 w-4 mr-2 text-[#10B981]" />
            Browse Cafeteria Menu
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerTitle="Checkout Tray" showBottomNav={false}>
      <div className="flex flex-col lg:flex-row gap-8 pb-24 lg:pb-8">

        {/* LEFT COLUMN: Scrollable Content (Items, Time, Notes) */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
                Your Order Tray
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review items, choose collection slot, and add notes
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3">
            {items.map(item => (
              <motion.div
                key={item.menuItem.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="rounded-3xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/60">
                      {item.menuItem.image_url ? (
                        <img
                          src={item.menuItem.image_url}
                          alt={item.menuItem.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UtensilsCrossed className="h-8 w-8 text-[#064E3B]/40" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-foreground text-base sm:text-lg line-clamp-1 font-display">
                            {item.menuItem.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {item.menuItem.is_veg !== false ? '🌱 Veg' : '🍖 Non-Veg'} • {item.menuItem.category || 'Special'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mt-1 -mr-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => removeItem(item.menuItem.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-lg text-foreground font-display">
                            ₹{(item.menuItem.price * item.quantity).toFixed(0)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            (₹{item.menuItem.price} each)
                          </span>
                        </div>

                        {/* Quantity Pill */}
                        <div className="flex items-center bg-[#D1FAE5] dark:bg-emerald-950/60 border border-[#10B981]/30 rounded-2xl h-9 px-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#064E3B] dark:text-emerald-300 hover:bg-white/60 dark:hover:bg-zinc-800 rounded-xl"
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-7 text-center font-black text-xs text-[#064E3B] dark:text-emerald-300">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#064E3B] dark:text-emerald-300 hover:bg-white/60 dark:hover:bg-zinc-800 rounded-xl"
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Time Slot Selection */}
          <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-5">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-4 font-display text-base">
              <Clock className="h-4 w-4 text-[#10B981]" />
              <span>Select Pickup Time Window</span>
            </h3>

            {slotsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/60 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : timeSlots?.length === 0 ? (
              <p className="text-muted-foreground text-center py-6 text-xs">
                No active pickup slots configured for today.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlots?.map(slot => {
                  const isFull = slot.current_orders >= slot.max_orders;
                  const spotsLeft = slot.max_orders - slot.current_orders;
                  const isSelected = selectedSlot === slot.id;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => !isFull && slot.is_active && setSelectedSlot(slot.id)}
                      className={`flex flex-col p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#064E3B] bg-[#D1FAE5]/30 dark:border-[#10B981] dark:bg-emerald-950/40 shadow-sm'
                          : 'border-border/80 bg-card hover:border-[#10B981]/40'
                      } ${isFull ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-foreground">
                          {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')} - {format(new Date(`2000-01-01T${slot.end_time}`), 'h:mm a')}
                        </span>
                        {isSelected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold ${isFull ? 'text-destructive' : 'text-[#065F46] dark:text-emerald-400'}`}>
                        {isFull ? 'Window Full' : `${spotsLeft} slots open`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Notes Card */}
          <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-5">
            <Label className="font-bold text-foreground mb-2.5 block text-sm font-display">
              Special Kitchen Instructions
            </Label>
            <Textarea
              placeholder="e.g. Less spicy, keep chutney separate, extra tissues..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none min-h-20 rounded-2xl text-sm bg-muted/40 border-border/80 focus:ring-2 focus:ring-[#10B981]"
            />
          </Card>
        </div>

        {/* RIGHT COLUMN: Order Summary & Payment Button (Desktop Sticky) */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-24 bg-card rounded-3xl border border-border/80 shadow-xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <h3 className="font-bold text-lg font-display text-foreground">Order Summary</h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
                <ShieldCheck className="h-4 w-4" />
                <span>Express Counter</span>
              </div>
            </div>

            <div className="space-y-3 pb-6 border-b border-border/80 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-foreground">₹{totalAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Prep Time</span>
                <span className="font-semibold text-foreground">~{estimatedPrepTime} mins</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Campus Service Fee</span>
                <span className="font-bold text-[#10B981] bg-[#D1FAE5] dark:bg-emerald-950/60 px-2 py-0.5 rounded-md text-xs">
                  FREE
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="font-bold text-base text-foreground">Total Payable</span>
              <span className="font-display font-black text-3xl text-[#064E3B] dark:text-emerald-400">
                ₹{totalAmount.toFixed(0)}
              </span>
            </div>

            <Button
              className="w-full h-13 bg-gradient-to-r from-[#064E3B] via-[#056046] to-[#10B981] hover:from-[#054030] hover:to-[#0d9668] text-white border border-[#D4AF37]/30 rounded-2xl text-base font-bold shadow-[0_8px_25px_rgba(6,78,59,0.25)] transition-all active:scale-[0.98]"
              onClick={handlePlaceOrder}
              disabled={!selectedSlot || !orderingEnabled || isProcessing || createOrder.isPending}
            >
              {(isProcessing || createOrder.isPending) ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-5 w-5 mr-2 text-[#D4AF37]" />
              )}
              <span>Complete Payment & Order</span>
            </Button>

            {!orderingEnabled && (
              <p className="text-center text-xs text-destructive font-semibold bg-destructive/10 py-2.5 rounded-xl border border-destructive/20">
                Ordering is currently paused by the canteen.
              </p>
            )}

            <div className="pt-2 text-center text-[11px] text-muted-foreground">
              Instant digital token with QR code generated immediately after checkout.
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
