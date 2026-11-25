import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { AdminSubNav } from '@/components/layout/AdminSubNav';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, XCircle, Package, QrCode, Sparkles, User, RefreshCw } from 'lucide-react';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { OrderStatus } from '@/types/database';
import { StatusBadge } from '@/components/ui/status-badge';

export default function AdminScan() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const updateStatus = useUpdateOrderStatus();

  useEffect(() => {
    if (!authLoading && (!user || (role !== 'admin' && role !== 'canteen_owner'))) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (!isScanning) return;

    const scannerId = "reader";
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        scannerId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScanResult(decodedText);
          setIsScanning(false);
          fetchOrderDetails(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      return () => {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [isScanning]);

  const fetchOrderDetails = async (orderId: string) => {
    setLoadingOrder(true);
    try {
      const data = await api.get(`/orders/${orderId}`);
      setOrderDetails(data);
    } catch (err) {
      console.error(err);
      toast.error("Invalid QR Code or Order Not Found");
      setScanResult(null);
      setIsScanning(true);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!orderDetails) return;
    try {
      await updateStatus.mutateAsync({ orderId: orderDetails.id, status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      setOrderDetails((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setOrderDetails(null);
    setIsScanning(true);
  };

  return (
    <Layout headerTitle="QR Express Scanner" showBack>
      <div className="max-w-xl mx-auto space-y-6 pt-2 pb-12">
        <AdminSubNav />

        {/* Top Header */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-1.5">
            <Sparkles className="h-3 w-3 text-[#D4AF37]" />
            <span>EXPRESS COLLECTION VALIDATOR</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">
            Counter Scanner
          </h1>
          <p className="text-xs text-muted-foreground">
            Scan student digital tokens at pickup to authenticate and mark orders as collected
          </p>
        </div>

        {/* Scanner Viewfinder Box */}
        {isScanning && (
          <Card className="rounded-3xl border border-border/80 bg-card shadow-lg p-6 overflow-hidden">
            <div id="reader" className="w-full rounded-2xl overflow-hidden border border-border"></div>
            <div className="text-center mt-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Align the student's collection pass QR code within the frame
              </p>
            </div>
          </Card>
        )}

        {/* Loading Order */}
        {loadingOrder && (
          <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#10B981] mx-auto mb-3" />
            <p className="font-bold text-sm text-foreground">Validating token with database...</p>
          </Card>
        )}

        {/* Order Details Result */}
        {orderDetails && !isScanning && (
          <Card className="rounded-3xl border border-[#10B981]/40 bg-card shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#064E3B] to-[#10B981] p-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                  VALIDATED COLLECTION PASS
                </span>
                <h3 className="text-2xl font-display font-black">
                  Token #{orderDetails.token_number}
                </h3>
              </div>
              <StatusBadge status={orderDetails.status} />
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3.5 bg-muted/40 rounded-2xl border border-border/60">
                <div className="h-10 w-10 rounded-xl bg-[#D1FAE5] text-[#064E3B] flex items-center justify-center font-bold text-sm shrink-0">
                  {orderDetails.profiles?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{orderDetails.profiles?.name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground truncate">{orderDetails.profiles?.email}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 border-y border-dashed border-border/80 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dishes to Hand Over</p>
                {orderDetails.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-foreground">
                      <span className="text-[#064E3B] dark:text-emerald-400 font-bold mr-1.5">{item.quantity}×</span>
                      {item.menu_item?.name}
                    </span>
                    <span className="font-bold text-foreground">₹{item.price_at_time * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between font-display font-bold text-base pt-2 border-t border-border/40">
                  <span>Total Amount</span>
                  <span className="text-[#064E3B] dark:text-emerald-400 font-black">₹{orderDetails.total_amount}</span>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-3 pt-1">
                {orderDetails.status !== 'collected' ? (
                  <Button
                    className="w-full h-12 bg-[#064E3B] hover:bg-[#054030] text-white rounded-2xl text-sm font-bold shadow-md border border-[#D4AF37]/30"
                    onClick={() => handleStatusUpdate('collected')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-[#10B981]" />
                    Hand Over Food & Mark Collected
                  </Button>
                ) : (
                  <div className="p-3 bg-[#D1FAE5] dark:bg-emerald-950/60 rounded-2xl border border-[#10B981]/40 text-center">
                    <p className="text-xs font-bold text-[#065F46] dark:text-emerald-300 flex items-center justify-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-[#10B981]" />
                      Order Already Collected
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full h-11 rounded-2xl text-xs font-bold border-border/80"
                  onClick={resetScanner}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Scan Next Token
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
