import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeSlot } from '@/types/database';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function useTimeSlots(activeOnly = false) {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['time-slots', activeOnly, today],
    queryFn: async () => {
      const data = await api.get<TimeSlot[]>(`/time-slots?date=${today}${activeOnly ? '&activeOnly=true' : ''}`);
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useCreateTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slot: Omit<TimeSlot, 'id' | 'current_orders'>) => {
      const data = await api.post<TimeSlot>('/time-slots', slot);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Time slot created');
    },
    onError: (error: any) => {
      toast.error('Failed to create time slot: ' + error.message);
    },
  });
}

export function useUpdateTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimeSlot> & { id: string }) => {
      const data = await api.put<TimeSlot>(`/time-slots/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Time slot updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update time slot: ' + error.message);
    },
  });
}

export function useDeleteTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/time-slots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Time slot deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete time slot: ' + error.message);
    },
  });
}
