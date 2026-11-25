import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { TokenDisplay } from '@/components/order/TokenDisplay';
import { OrderStepper } from '@/components/order/OrderStepper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentOrders } from '@/hooks/useOrders';
import { generateOrderReceipt } from '@/utils/generateReceipt';
import { format } from 'date-fns';
import { Clock, MapPin, Download, CheckCircle, ArrowLeft, UtensilsCrossed, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useStudentOrders(user?.id);

  const order = orders?.find(o => o.id === orderId);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleDownloadReceipt = () => {
    if (order) {
      generateOrderReceipt(order, profile?.name || 'Customer');
    }
  };

  if (isLoading || authLoading) {
    return (
      <Layout headerTitle="Order Pass" showBack showBottomNav={false}>
        <div className="space-y-4 max-w-xl mx-auto w-full pt-4">
          <Skeleton className="h-64 rounded-3xl bg-card border border-border" />
          <Skeleton className="h-48 rounded-3xl bg-card border border-border" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout headerTitle="Order Details" showBack showBottomNav={false}>
        <div className="flex flex-col items-center justify-center px-6 py-20 max-w-md mx-auto text-center">
          <h1 className="text-xl font-bold font-display text-foreground mb-2">
            Order not found
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            This order reference doesn't exist or you don't have access permissions.
          </p>
          <Button onClick={() => navigate('/orders')} className="h-11 rounded-2xl bg-[#064E3B] text-white">
            View My Orders
          </Button>
        </div>
      </Layout>
    );
  }

  const isPaid = order.status !== 'placed' && order.status !== 'cancelled';

  return (
    <Layout headerTitle={`Order #${order.token_number}`} showBack showBottomNav={false}>
      <div className="space-y-6 max-w-2xl mx-auto w-full pb-24 pt-2">

        {/* Stepper Progress */}
        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-4">
          <OrderStepper status={order.status} />
        </Card>

        {/* Token Display Hero */}
        <TokenDisplay order={order} />

        {/* QR Code for Express Counter Scan */}
        <Card className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/60">
              <QRCodeSVG
                value={order.id}
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>
            <div>
              <p className="font-bold text-foreground text-base font-display">Express Collection QR</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show this digital ticket at the counter scanner</p>
            </div>
          </CardContent>
        </Card>

        {/* Pickup Details & Summary */}
        <Card className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#10B981]" />
                <span className="font-bold text-sm text-foreground">Pickup Location</span>
              </div>
              <span className="text-xs font-semibold text-[#064E3B] dark:text-emerald-300 bg-[#D1FAE5] dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                Main Canteen, Express Window
              </span>
            </div>

            {order.time_slot && (
              <div className="flex items-center justify-between pb-4 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#10B981]" />
                  <span className="font-bold text-sm text-foreground">Reserved Window</span>
                </div>
                <span className="text-xs font-medium text-foreground">
                  {format(new Date(`2000-01-01T${order.time_slot.start_time}`), 'h:mm a')} - {format(new Date(`2000-01-01T${order.time_slot.end_time}`), 'h:mm a')}
                </span>
              </div>
            )}

            {/* Itemized Order List */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Itemized Summary
              </p>
              <div className="space-y-2.5">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs bg-muted px-2 py-0.5 rounded-md">
                        {item.quantity}×
                      </span>
                      <span className="font-medium text-foreground">{item.menu_item?.name}</span>
                    </div>
                    <span className="font-bold text-foreground">
                      ₹{item.unit_price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Row */}
            <div className="pt-4 border-t border-border/80 flex justify-between items-baseline">
              <div>
                <p className="font-bold text-base text-foreground">Total Paid</p>
                <p className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="h-3 w-3" /> Digital invoice verified
                </p>
              </div>
              <p className="font-display font-black text-2xl text-[#064E3B] dark:text-emerald-400">
                ₹{order.total_amount}
              </p>
            </div>

            {/* Download Receipt Button */}
            <div className="pt-2">
              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                className="w-full h-11 rounded-2xl border-border/80 hover:bg-[#D1FAE5]/40 text-[#064E3B] dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4 text-[#10B981]" />
                Download PDF Receipt
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
