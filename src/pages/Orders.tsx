import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { OrderCard } from '@/components/order/OrderCard';
import { useStudentOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, UtensilsCrossed, Bell, BellOff, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { motion } from 'framer-motion';

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useStudentOrders(user?.id);
  const { isSupported, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const activeOrders = orders?.filter(o =>
    ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)
  ) || [];

  const orderHistory = orders?.filter(o =>
    ['collected', 'cancelled'].includes(o.status)
  ) || [];

  if (isLoading || authLoading) {
    return (
      <Layout headerTitle="My Orders">
        <div className="space-y-4 max-w-2xl mx-auto pt-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-3xl bg-card border border-border" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!orders?.length) {
    return (
      <Layout headerTitle="My Orders">
        <div className="flex flex-col items-center justify-center px-6 py-20 min-h-[60vh] max-w-md mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-24 w-24 rounded-3xl bg-[#D1FAE5] dark:bg-emerald-950/60 flex items-center justify-center mb-6 shadow-sm border border-[#10B981]/20"
          >
            <ClipboardList className="h-12 w-12 text-[#064E3B] dark:text-emerald-300" />
          </motion.div>
          <h1 className="text-2xl font-bold font-display text-foreground mb-2">
            No orders placed yet
          </h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Your culinary journey starts here. Explore our daily menu and place your first express token order.
          </p>
          <Button
            onClick={() => navigate('/menu')}
            className="h-12 px-8 bg-[#064E3B] hover:bg-[#054030] text-white rounded-2xl text-sm font-bold shadow-md border border-[#D4AF37]/30 transition-all hover:scale-105"
          >
            <UtensilsCrossed className="h-4 w-4 mr-2 text-[#10B981]" />
            Explore Today's Menu
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerTitle="My Orders">
      <div className="space-y-6 max-w-2xl mx-auto pb-24">
        {/* Header Title on Desktop */}
        <div className="hidden sm:flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-foreground">
              My Orders & Tokens
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live tracking and collection receipts
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300">
            {orders.length} Total
          </span>
        </div>

        {/* Push Notification Toggle Card */}
        {isSupported && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    isSubscribed ? 'bg-[#D1FAE5] text-[#064E3B]' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isSubscribed ? <Bell className="h-4 w-4 text-[#10B981]" /> : <BellOff className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {isSubscribed ? 'Live Order Alerts Active' : 'Enable Order Pickup Alerts'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Get notified the moment food is ready at the counter
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold rounded-xl border-border/80 hover:bg-[#D1FAE5]/40 text-[#064E3B] dark:text-emerald-300"
                  onClick={() => isSubscribed ? unsubscribe() : subscribe()}
                  disabled={pushLoading}
                >
                  {pushLoading ? '...' : isSubscribed ? 'Disable' : 'Turn On'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <h2 className="text-base font-bold font-display text-foreground">
                In-Progress ({activeOrders.length})
              </h2>
            </div>
            <div className="space-y-4">
              {activeOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Order History Section */}
        {orderHistory.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span>Past Orders ({orderHistory.length})</span>
            </h2>
            <div className="space-y-4">
              {orderHistory.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
