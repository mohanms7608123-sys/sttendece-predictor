import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { AdminSubNav } from '@/components/layout/AdminSubNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useCanteenOrders } from '@/hooks/useOrders';
import { useSystemSettings, useUpdateSetting } from '@/hooks/useSystemSettings';
import {
  UtensilsCrossed, Clock, ClipboardList, Settings,
  AlertTriangle, Users, TrendingUp, Pause, Play, Shield,
  QrCode, ChefHat, Sparkles, ArrowRight
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: menuItems, isLoading: menuLoading } = useMenuItems();
  const { data: timeSlots, isLoading: slotsLoading } = useTimeSlots();
  const { data: orders, isLoading: ordersLoading } = useCanteenOrders();
  const { data: settings, isLoading: settingsLoading } = useSystemSettings();
  const updateSetting = useUpdateSetting();

  const [emergencyNotice, setEmergencyNotice] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (settings?.emergency_notice) {
      setEmergencyNotice(settings.emergency_notice);
    }
  }, [settings]);

  const isLoading = authLoading || menuLoading || slotsLoading || ordersLoading || settingsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 pt-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const orderingEnabled = settings?.ordering_enabled === 'true';
  const activeOrders = orders?.filter(o => !['collected', 'cancelled'].includes(o.status)).length || 0;
  const todayTotal = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  const availableItems = menuItems?.filter(i => i.is_available).length || 0;
  const activeSlots = timeSlots?.filter(s => s.is_active).length || 0;

  const toggleOrdering = async () => {
    await updateSetting.mutateAsync({
      key: 'ordering_enabled',
      value: orderingEnabled ? 'false' : 'true'
    });
  };

  const saveEmergencyNotice = async () => {
    await updateSetting.mutateAsync({
      key: 'emergency_notice',
      value: emergencyNotice.trim()
    });
    toast.success('Emergency notice broadcast updated');
  };

  return (
    <Layout>
      <div className="space-y-6 pt-2 pb-12">
        {/* Sub-Navigation Bar */}
        <AdminSubNav />

        {/* Top Header & Ordering Killswitch */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-1.5">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" />
              <span>EXECUTIVE CONTROL CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
              Cafeteria Management Console
            </h1>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring, financial tracking, and kitchen dispatch controls
            </p>
          </div>

          <div className="flex items-center gap-3 bg-card p-2 px-3.5 rounded-2xl border border-border/80 shadow-sm">
            <span className="text-xs font-bold text-foreground">Ordering System:</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={orderingEnabled}
                onCheckedChange={toggleOrdering}
              />
              <span className="text-xs font-bold">
                {orderingEnabled ? (
                  <span className="text-[#10B981] flex items-center gap-1 bg-[#D1FAE5] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <Play className="h-3 w-3 fill-current" /> Online
                  </span>
                ) : (
                  <span className="text-destructive flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full">
                    <Pause className="h-3 w-3" /> Paused
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Orders */}
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Queue</span>
                <div className="p-2.5 rounded-2xl bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300">
                  <ClipboardList className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-display font-black text-foreground">
                {activeOrders}
              </p>
              <p className="text-[11px] text-[#10B981] font-semibold mt-1">In kitchen queue</p>
            </Card>
          </motion.div>

          {/* Today's Revenue */}
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Revenue</span>
                <div className="p-2.5 rounded-2xl bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-display font-black text-[#064E3B] dark:text-emerald-400">
                ₹{todayTotal.toFixed(0)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Settled & in-progress</p>
            </Card>
          </motion.div>

          {/* Menu Items */}
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Menu</span>
                <div className="p-2.5 rounded-2xl bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-display font-black text-foreground">
                {availableItems}
                <span className="text-sm font-medium text-muted-foreground ml-1">/ {menuItems?.length || 0}</span>
              </p>
              <p className="text-[11px] text-[#10B981] font-semibold mt-1">Available today</p>
            </Card>
          </motion.div>

          {/* Active Slots */}
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pickup Slots</span>
                <div className="p-2.5 rounded-2xl bg-muted text-foreground">
                  <Clock className="h-4 w-4 text-[#10B981]" />
                </div>
              </div>
              <p className="text-3xl font-display font-black text-foreground">
                {activeSlots}
                <span className="text-sm font-medium text-muted-foreground ml-1">/ {timeSlots?.length || 0}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Windows active</p>
            </Card>
          </motion.div>
        </div>

        {/* Quick Action SaaS Cards */}
        <div>
          <h2 className="text-base font-bold font-display text-foreground mb-4">
            Operations & Workflows
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/menu">
              <Card className="rounded-3xl border border-border/80 bg-card shadow-sm hover:shadow-lg hover:border-[#10B981]/40 transition-all p-5 h-full flex flex-col justify-between group">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-[#D1FAE5] text-[#064E3B] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UtensilsCrossed className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base text-foreground font-display mb-1">
                    Menu Catalog
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Upload dish photos, edit prices, set prep times, and toggle sold-out status.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-[#064E3B] dark:text-emerald-400">
                  <span>Manage Items</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            <Link to="/canteen">
              <Card className="rounded-3xl border border-border/80 bg-card shadow-sm hover:shadow-lg hover:border-[#10B981]/40 transition-all p-5 h-full flex flex-col justify-between group">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-[#D1FAE5] text-[#064E3B] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ChefHat className="h-6 w-6 text-[#10B981]" />
                  </div>
                  <h3 className="font-bold text-base text-foreground font-display mb-1">
                    Live Kitchen KDS
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Accept incoming token orders, advance cooking stages, and notify students in real time.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-[#064E3B] dark:text-emerald-400">
                  <span>Launch KDS</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            <Link to="/admin/slots">
              <Card className="rounded-3xl border border-border/80 bg-card shadow-sm hover:shadow-lg hover:border-[#10B981]/40 transition-all p-5 h-full flex flex-col justify-between group">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-bold text-base text-foreground font-display mb-1">
                    Pickup Windows
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Set window timings, throttle order limits per slot, and prevent cafeteria overcrowding.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-[#064E3B] dark:text-emerald-400">
                  <span>Configure Slots</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            <Link to="/admin/audit-logs">
              <Card className="rounded-3xl border border-border/80 bg-card shadow-sm hover:shadow-lg hover:border-[#10B981]/40 transition-all p-5 h-full flex flex-col justify-between group">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-muted text-foreground flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6 text-[#064E3B] dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-base text-foreground font-display mb-1">
                    System Audit Trail
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Track staff activity, status overrides, payment events, and security access records.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-[#064E3B] dark:text-emerald-400">
                  <span>Review Logs</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Emergency Notice Broadcast Card */}
        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-display text-foreground">Campus Emergency Notice Broadcast</h3>
              <p className="text-xs text-muted-foreground">Banner broadcasted instantaneously to all students on the menu page</p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="e.g. Counter #2 closed for maintenance • Fresh snacks arriving at 4:00 PM"
              value={emergencyNotice}
              onChange={(e) => setEmergencyNotice(e.target.value)}
              className="h-12 rounded-2xl text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={saveEmergencyNotice}
                className="bg-[#064E3B] hover:bg-[#054030] text-white rounded-xl text-xs font-bold h-10 px-5"
              >
                Broadcast Notice
              </Button>
              {emergencyNotice && (
                <Button
                  variant="outline"
                  className="rounded-xl text-xs font-bold h-10"
                  onClick={() => {
                    setEmergencyNotice('');
                    updateSetting.mutate({ key: 'emergency_notice', value: '' });
                  }}
                >
                  Clear Banner
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
