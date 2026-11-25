import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus, OrderWithDetails, CartItem } from '@/types/database';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useStudentOrders(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    const handleOrderUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'student', userId] });
    };

    socket.on('order:updated', handleOrderUpdate);
    socket.on('orders:changed', handleOrderUpdate);

    return () => {
      socket.off('order:updated', handleOrderUpdate);
      socket.off('orders:changed', handleOrderUpdate);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['orders', 'student', userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await api.get<OrderWithDetails[]>(`/orders/student/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useCanteenOrders() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', 'canteen'],
    queryFn: async () => {
      const data = await api.get<OrderWithDetails[]>('/orders/canteen');
      return data;
    },
    refetchInterval: 15000, // Refresh fallback every 15s
  });

  // Real-time subscription for orders using Socket.IO
  useEffect(() => {
    const socket = getSocket();

    const handleRealtimeOrder = () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'canteen'] });
    };

    socket.on('order:created', handleRealtimeOrder);
    socket.on('order:updated', handleRealtimeOrder);
    socket.on('orders:changed', handleRealtimeOrder);

    return () => {
      socket.off('order:created', handleRealtimeOrder);
      socket.off('order:updated', handleRealtimeOrder);
      socket.off('orders:changed', handleRealtimeOrder);
    };
  }, [queryClient]);

  return query;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      timeSlotId,
      items,
      totalAmount,
      notes,
    }: {
      userId: string;
      timeSlotId: string;
      items: CartItem[];
      totalAmount: number;
      notes?: string;
    }) => {
      const data = await api.post<Order>('/orders', {
        userId,
        timeSlotId,
        items,
        totalAmount,
        notes,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Order placed successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to place order: ' + error.message);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const data = await api.put<Order>(`/orders/${orderId}/status`, { status });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Order ${variables.status}`);
    },
    onError: (error: any) => {
      toast.error('Failed to update order: ' + error.message);
    },
  });
}
