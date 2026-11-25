export type AppRole = 'student' | 'canteen_owner' | 'admin';
export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'ready' | 'collected' | 'cancelled';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  usn: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  prep_time: number;
  is_available: boolean;
  category: string;
  is_veg?: boolean;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  current_orders: number;
  is_active: boolean;
  slot_date: string;
}

export interface Order {
  id: string;
  user_id: string;
  token_number: number;
  time_slot_id: string;
  total_amount: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderWithDetails extends Order {
  time_slot?: TimeSlot;
  order_items?: (OrderItem & { menu_item?: MenuItem })[];
  profile?: Profile;
}
