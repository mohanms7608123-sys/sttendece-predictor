import { useEffect, useState, useRef } from 'react';
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
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '@/hooks/useMenuItems';
import { MenuItem } from '@/types/database';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, UtensilsCrossed, ArrowLeft, Upload, Image, Loader2, Clock, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminMenu() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: menuItems, isLoading } = useMenuItems();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    prep_time: '10',
    image_url: '',
    is_available: true
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      prep_time: '10',
      image_url: '',
      is_available: true
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category || '',
      prep_time: item.prep_time.toString(),
      image_url: item.image_url || '',
      is_available: item.is_available
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const data = await api.post('/upload', {
        data: base64Data,
        fileName: file.name,
      });

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const prepTime = parseInt(formData.prep_time) || 10;

    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          name: formData.name.trim(),
          price,
          category: formData.category.trim() || undefined,
          prep_time: prepTime,
          image_url: formData.image_url || undefined,
          is_available: formData.is_available
        });
        toast.success('Menu item updated');
      } else {
        await createItem.mutateAsync({
          name: formData.name.trim(),
          price,
          category: formData.category.trim() || undefined,
          prep_time: prepTime,
          image_url: formData.image_url || undefined,
          is_available: formData.is_available
        });
        toast.success('Menu item created');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      await deleteItem.mutateAsync(id);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    await updateItem.mutateAsync({ id: item.id, is_available: !item.is_available });
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="space-y-6 pt-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-3xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Group by category
  const groupedItems = menuItems?.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
              <span>CATALOG CONTROLLER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
              Menu Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure dishes, prices, preparation timing, and real-time counter availability
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#064E3B] hover:bg-[#054030] text-white rounded-2xl text-xs font-bold h-11 px-6 shadow-md border border-[#D4AF37]/30">
                <Plus className="h-4 w-4 mr-1.5 text-[#10B981]" />
                Add New Dish
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7">
              <DialogHeader>
                <DialogTitle className="font-display font-extrabold text-xl">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* Image Upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Dish Image</Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border/80 cursor-pointer hover:border-[#10B981] transition-colors shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {formData.image_url ? (
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-[#10B981]" />
                      ) : (
                        <Image className="h-8 w-8 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs font-semibold h-9"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5 mr-1.5 text-[#10B981]" />
                            Upload Photo
                          </>
                        )}
                      </Button>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Recommended: 1200×800 JPG/PNG, under 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Dish Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Masala Dosa, Paneer Butter Masala"
                    className="h-11 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Price (₹) *</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 80"
                      min="0"
                      step="1"
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Prep Time (mins)</Label>
                    <Input
                      type="number"
                      value={formData.prep_time}
                      onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                      placeholder="10"
                      min="1"
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Breakfast, Main Course, Beverages, Snacks"
                    className="h-11 rounded-xl text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-2xl border border-border/60">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Available for Online Order</Label>
                    <p className="text-[11px] text-muted-foreground">Toggle off to mark dish as Sold Out</p>
                  </div>
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#064E3B] hover:bg-[#054030] text-white rounded-xl text-xs font-bold h-11"
                    disabled={createItem.isPending || updateItem.isPending || uploading}
                  >
                    {editingItem ? 'Save Updates' : 'Add to Cafeteria Catalog'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Empty Catalog State */}
        {!menuItems?.length ? (
          <Card className="border-dashed border-2 rounded-3xl p-12 text-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-foreground mb-1 font-display">No menu items created yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Start building your menu by adding the first dish to the cafeteria system.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#064E3B] hover:bg-[#054030] text-white rounded-xl text-xs font-bold h-10 px-5"
            >
              <Plus className="h-4 w-4 mr-1.5 text-[#10B981]" />
              Add First Dish
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedItems && Object.entries(groupedItems).map(([category, items]) => (
              <section key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-display text-foreground">{category}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300">
                    {items.length}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(item => (
                    <Card
                      key={item.id}
                      className={`rounded-3xl border border-border/80 bg-card p-4 transition-all duration-200 shadow-sm hover:shadow-md ${
                        !item.is_available ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex gap-3.5">
                        <div className="h-20 w-20 rounded-2xl bg-muted shrink-0 overflow-hidden border border-border/60">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[#D1FAE5]/30">
                              <UtensilsCrossed className="h-7 w-7 text-[#064E3B]/40" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-foreground truncate text-base font-display">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-black text-sm text-[#064E3B] dark:text-emerald-400">
                                  ₹{item.price}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-[#10B981]" />
                                  {item.prep_time}m
                                </span>
                              </div>
                            </div>

                            <Switch
                              checked={item.is_available}
                              onCheckedChange={() => toggleAvailability(item)}
                              aria-label="Toggle availability"
                            />
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              item.is_available ? 'text-[#10B981]' : 'text-muted-foreground'
                            }`}>
                              {item.is_available ? 'In Stock' : 'Sold Out'}
                            </span>

                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => openEditDialog(item)}
                                aria-label="Edit item"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(item.id)}
                                aria-label="Delete item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
