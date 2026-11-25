import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuItem } from '@/types/database';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function useMenuItems(availableOnly = false) {
  return useQuery({
    queryKey: ['menu-items', availableOnly],
    queryFn: async () => {
      const data = await api.get<MenuItem[]>(`/menu${availableOnly ? '?availableOnly=true' : ''}`);
      return data;
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<MenuItem, 'id' | 'created_at'>) => {
      const data = await api.post<MenuItem>('/menu', item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add menu item: ' + error.message);
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenuItem> & { id: string }) => {
      const data = await api.put<MenuItem>(`/menu/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update menu item: ' + error.message);
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete menu item: ' + error.message);
    },
  });
}
