import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { AdminSubNav } from '@/components/layout/AdminSubNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { useTimeSlots, useCreateTimeSlot, useUpdateTimeSlot, useDeleteTimeSlot } from '@/hooks/useTimeSlots';
import { TimeSlot } from '@/types/database';
import { Plus, Pencil, Trash2, Clock, Users, Sparkles, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminSlots() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: timeSlots, isLoading } = useTimeSlots();
  const createSlot = useCreateTimeSlot();
  const updateSlot = useUpdateTimeSlot();
  const deleteSlot = useDeleteTimeSlot();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    start_time: '12:00',
    end_time: '12:30',
    max_orders: '20',
    is_active: true
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  const resetForm = () => {
    setFormData({
      start_time: '12:00',
      end_time: '12:30',
      max_orders: '20',
      is_active: true
    });
    setEditingSlot(null);
  };

  const openEditDialog = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      max_orders: slot.max_orders.toString(),
      is_active: slot.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.start_time || !formData.end_time) {
      toast.error('Please fill in both start and end times');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const slotData = {
      start_time: formData.start_time + ':00',
      end_time: formData.end_time + ':00',
      max_orders: parseInt(formData.max_orders) || 20,
      is_active: formData.is_active,
      slot_date: today
    };

    try {
      if (editingSlot) {
        await updateSlot.mutateAsync({ id: editingSlot.id, ...slotData });
        toast.success('Pickup slot updated');
      } else {
        await createSlot.mutateAsync(slotData);
        toast.success('New pickup window created');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save slot');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this pickup slot?')) {
      await deleteSlot.mutateAsync(id);
      toast.success('Pickup slot deleted');
    }
  };

  const toggleActive = async (slot: TimeSlot) => {
    await updateSlot.mutateAsync({ id: slot.id, is_active: !slot.is_active });
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="space-y-6 pt-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-3xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack>
      <div className="space-y-6 pt-2 pb-12">
        {/* Sub-Navigation Bar */}
        <AdminSubNav />

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-1.5">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" />
              <span>DISPATCH CAPACITY CONTROLLER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
              Pickup Time Windows
            </h1>
            <p className="text-xs text-muted-foreground">
              Schedule active cafeteria pickup windows for {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#064E3B] hover:bg-[#054030] text-white rounded-2xl text-xs font-bold h-11 px-6 shadow-md border border-[#D4AF37]/30">
                <Plus className="h-4 w-4 mr-1.5 text-[#10B981]" />
                Add Pickup Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7">
              <DialogHeader>
                <DialogTitle className="font-display font-extrabold text-xl">
                  {editingSlot ? 'Edit Pickup Slot' : 'Create Pickup Slot'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Start Time *</Label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">End Time *</Label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Max Order Capacity *</Label>
                  <Input
                    type="number"
                    value={formData.max_orders}
                    onChange={(e) => setFormData({ ...formData, max_orders: e.target.value })}
                    min="1"
                    max="100"
                    placeholder="20"
                    className="h-11 rounded-xl text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Maximum simultaneous student collection tokens</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-2xl border border-border/60">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Active for Online Booking</Label>
                    <p className="text-[11px] text-muted-foreground">Toggle off to temporarily close this slot</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#064E3B] hover:bg-[#054030] text-white rounded-xl text-xs font-bold h-11"
                  >
                    {editingSlot ? 'Save Changes' : 'Create Window'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Empty State */}
        {!timeSlots?.length ? (
          <Card className="border-dashed border-2 rounded-3xl p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-foreground mb-1 font-display">No pickup slots scheduled for today</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Add pickup time windows to allow students to reserve order slots.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#064E3B] hover:bg-[#054030] text-white rounded-xl text-xs font-bold h-10 px-5"
            >
              <Plus className="h-4 w-4 mr-1.5 text-[#10B981]" />
              Schedule First Slot
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map(slot => {
              const isFull = slot.current_orders >= slot.max_orders;
              const fillPercentage = (slot.current_orders / slot.max_orders) * 100;

              return (
                <Card
                  key={slot.id}
                  className={`rounded-3xl border border-border/80 bg-card p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
                    !slot.is_active ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
                        slot.is_active ? 'bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base font-display">
                          {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-semibold">
                          to {format(new Date(`2000-01-01T${slot.end_time}`), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={slot.is_active}
                      onCheckedChange={() => toggleActive(slot)}
                      aria-label="Toggle slot"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#10B981]" />
                        Token Capacity
                      </span>
                      <span className={`font-bold ${isFull ? 'text-destructive' : 'text-foreground'}`}>
                        {slot.current_orders} / {slot.max_orders} orders
                      </span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isFull ? 'bg-destructive' : fillPercentage > 75 ? 'bg-[#D4AF37]' : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl text-xs font-semibold h-8"
                      onClick={() => openEditDialog(slot)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1 text-[#10B981]" />
                      Edit Slot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-destructive hover:bg-destructive/10 h-8 px-2.5"
                      onClick={() => handleDelete(slot.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
