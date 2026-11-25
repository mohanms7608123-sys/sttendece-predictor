import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { AdminSubNav } from '@/components/layout/AdminSubNav';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCanteenOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useSystemSettings, useUpdateSetting } from '@/hooks/useSystemSettings';
import { OrderWithDetails, OrderStatus } from '@/types/database';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import {
  Bell, Pause, Play, Clock, AlertTriangle,
  ChefHat, CheckCircle, Package, XCircle,
  Volume2, VolumeX, MessageSquare, Sparkles, User
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const STATUS_ACTIONS: Record<OrderStatus, { next: OrderStatus | null; label: string; icon: React.ElementType }> = {
  placed: { next: 'accepted', label: 'Accept Order', icon: CheckCircle },
  accepted: { next: 'preparing', label: 'Start Cooking', icon: ChefHat },
  preparing: { next: 'ready', label: 'Mark Ready at Counter', icon: Bell },
  ready: { next: 'collected', label: 'Confirm Collected', icon: Package },
  collected: { next: null, label: 'Completed', icon: Package },
  cancelled: { next: null, label: 'Cancelled', icon: XCircle },
};

const SMS_TRIGGER_STATUSES: OrderStatus[] = ['accepted', 'preparing', 'ready', 'cancelled'];

export default function CanteenDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useCanteenOrders();
  const { data: settings } = useSystemSettings();
  const updateStatus = useUpdateOrderStatus();
  const updateSetting = useUpdateSetting();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderCountRef = useRef<number>(0);

  useEffect(() => {
    if (!authLoading && (!user || (role !== 'canteen_owner' && role !== 'admin'))) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  // Sound notification for new incoming orders
  useEffect(() => {
    const currentPlacedCount = orders?.filter(o => o.status === 'placed').length || 0;

    if (soundEnabled && currentPlacedCount > prevOrderCountRef.current) {
      try {
        audioRef.current = new Audio('/notification.mp3');
        audioRef.current.play().catch(() => {
          toast.info('🔔 New incoming order token received!');
        });
      } catch {
        toast.info('🔔 New incoming order token received!');
      }
    }

    prevOrderCountRef.current = currentPlacedCount;
  }, [orders, soundEnabled]);

  const orderingEnabled = settings?.ordering_enabled === 'true';

  const toggleOrdering = async () => {
    await updateSetting.mutateAsync({
      key: 'ordering_enabled',
      value: orderingEnabled ? 'false' : 'true'
    });
  };

  const sendSmsNotification = async (orderId: string, status: OrderStatus) => {
    if (!smsEnabled || !SMS_TRIGGER_STATUSES.includes(status)) return;
    try {
      await api.post('/notifications/sms', { orderId, status });
    } catch (err) {
      console.error('SMS notification error:', err);
    }
  };

  const sendEmailNotification = async (orderId: string, status: OrderStatus) => {
    if (!SMS_TRIGGER_STATUSES.includes(status)) return;
    try {
      await api.post('/notifications/email', { orderId, status });
    } catch (err) {
      console.error('Email notification error:', err);
    }
  };

  const sendPushNotification = async (order: OrderWithDetails, status: OrderStatus) => {
    if (!SMS_TRIGGER_STATUSES.includes(status)) return;
    try {
      await api.post('/notifications/push', {
        userId: order.user_id,
        orderId: order.id,
        status,
        tokenNumber: order.token_number
      });
    } catch (err) {
      console.error('Push notification error:', err);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    const order = orders?.find(o => o.id === orderId);
    await updateStatus.mutateAsync({ orderId, status });

    sendSmsNotification(orderId, status);
    sendEmailNotification(orderId, status);
    if (order) {
      sendPushNotification(order, status);
    }

    if (SMS_TRIGGER_STATUSES.includes(status)) {
      toast.success('Customer notified of status advancement');
    }
  };

  const groupedOrders = {
    placed: orders?.filter(o => o.status === 'placed') || [],
    accepted: orders?.filter(o => o.status === 'accepted') || [],
    preparing: orders?.filter(o => o.status === 'preparing') || [],
    ready: orders?.filter(o => o.status === 'ready') || [],
  };

  const totalActive = Object.values(groupedOrders).flat().length;

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="space-y-6 pt-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack>
      <div className="space-y-6 pt-2 pb-12">
        {/* Sub-Navigation if Admin */}
        {role === 'admin' && <AdminSubNav />}

        {/* Top Header & Kitchen Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-1.5">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" />
              <span>KITCHEN DISPATCH SYSTEM (KDS)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
              Live Cooking Queue
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalActive} tickets in active kitchen dispatch
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSmsEnabled(!smsEnabled)}
              className="h-10 rounded-xl text-xs font-bold border-border/80"
            >
              <MessageSquare className={`h-3.5 w-3.5 mr-1.5 ${smsEnabled ? 'text-[#10B981]' : 'text-muted-foreground'}`} />
              SMS: {smsEnabled ? 'On' : 'Off'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-10 rounded-xl text-xs font-bold border-border/80"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 mr-1.5 text-[#10B981]" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              )}
              Sound: {soundEnabled ? 'On' : 'Off'}
            </Button>

            <div className="flex items-center gap-2 bg-card p-2 px-3 rounded-xl border border-border/80">
              <Switch
                checked={orderingEnabled}
                onCheckedChange={toggleOrdering}
              />
              <span className="text-xs font-bold">
                {orderingEnabled ? (
                  <span className="text-[#10B981] flex items-center gap-1">
                    <Play className="h-3 w-3 fill-current" /> Live
                  </span>
                ) : (
                  <span className="text-destructive flex items-center gap-1">
                    <Pause className="h-3 w-3" /> Paused
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(groupedOrders).map(([status, statusOrders]) => {
            const statusConfig = {
              placed: { label: '1. Incoming', bg: 'bg-[#F3F4F6] dark:bg-zinc-800', text: 'text-[#1F2937] dark:text-zinc-200', icon: Clock },
              accepted: { label: '2. Accepted', bg: 'bg-[#E0F2FE] dark:bg-sky-950/40', text: 'text-[#0369A1] dark:text-sky-300', icon: CheckCircle },
              preparing: { label: '3. Cooking', bg: 'bg-[#FFFBEB] dark:bg-amber-950/40', text: 'text-[#92400E] dark:text-amber-300', icon: ChefHat },
              ready: { label: '4. Ready at Counter', bg: 'bg-[#D1FAE5] dark:bg-emerald-950/40', text: 'text-[#065F46] dark:text-emerald-300', icon: Bell },
            }[status as keyof typeof groupedOrders];

            const Icon = statusConfig.icon;

            return (
              <Card
                key={status}
                className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {statusConfig.label}
                  </span>
                  <div className={`p-2 rounded-xl ${statusConfig.bg} ${statusConfig.text}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-display font-black text-foreground">
                    {statusOrders.length}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-semibold">orders</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Live Orders Column Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(groupedOrders).map(([status, statusOrders]) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-bold text-sm font-display capitalize text-foreground flex items-center gap-1.5">
                  <span>{status}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                    {statusOrders.length}
                  </span>
                </h2>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {statusOrders.length === 0 ? (
                  <Card className="border-dashed border-2 rounded-3xl p-6 text-center text-muted-foreground">
                    <p className="text-xs font-medium">No tickets in this stage</p>
                  </Card>
                ) : (
                  statusOrders.map(order => (
                    <KitchenOrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function KitchenOrderCard({
  order,
  onStatusUpdate
}: {
  order: OrderWithDetails;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
}) {
  const action = STATUS_ACTIONS[order.status];
  const Icon = action.icon;

  const isDelayed = order.status === 'preparing' &&
    new Date().getTime() - new Date(order.updated_at).getTime() > 15 * 60 * 1000;

  return (
    <Card className={`rounded-3xl border transition-all duration-200 bg-card shadow-sm hover:shadow-md p-4 space-y-3.5 ${
      isDelayed ? 'border-amber-400 bg-amber-50/20' : 'border-border/80'
    }`}>
      {/* Ticket Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">
            TOKEN NUMBER
          </span>
          <span className="font-display font-black text-2xl text-[#064E3B] dark:text-emerald-400">
            #{order.token_number}
          </span>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3 w-3 text-[#10B981]" />
            {format(new Date(order.created_at), 'h:mm a')}
          </div>
          {order.profile?.name && (
            <p className="text-[11px] font-medium text-foreground truncate max-w-[110px] mt-0.5">
              {order.profile.name}
            </p>
          )}
        </div>
      </div>

      {/* Delayed notice */}
      {isDelayed && (
        <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold animate-pulse">
          <AlertTriangle className="h-3.5 w-3.5 text-[#D4AF37]" />
          <span>{'Cooking > 15 mins'}</span>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-1.5 py-2 border-y border-dashed border-border/70 text-xs">
        {order.order_items?.map(item => (
          <div key={item.id} className="flex justify-between items-center">
            <span className="font-bold text-foreground">
              <span className="text-[#064E3B] dark:text-emerald-400 mr-1.5 font-black">{item.quantity}×</span>
              {item.menu_item?.name}
            </span>
          </div>
        ))}
      </div>

      {/* Notes if any */}
      {order.notes && (
        <div className="bg-[#FEF3C7] dark:bg-amber-950/50 p-2.5 rounded-xl text-xs text-amber-900 dark:text-amber-200 border border-[#D4AF37]/30">
          <p className="font-bold text-[10px] uppercase tracking-wider text-[#92400E]">Special Instructions:</p>
          <p className="mt-0.5">{order.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-1.5 pt-1">
        {action.next && (
          <Button
            className="w-full h-10 bg-[#064E3B] hover:bg-[#054030] text-white rounded-xl text-xs font-bold shadow-sm border border-[#D4AF37]/30 transition-all active:scale-[0.98]"
            size="sm"
            onClick={() => onStatusUpdate(order.id, action.next!)}
          >
            <Icon className="h-3.5 w-3.5 mr-1.5 text-[#10B981]" />
            {action.label}
          </Button>
        )}

        {order.status !== 'cancelled' && order.status !== 'collected' && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 text-[11px] font-semibold"
            onClick={() => onStatusUpdate(order.id, 'cancelled')}
          >
            Cancel Ticket
          </Button>
        )}
      </div>
    </Card>
  );
}
