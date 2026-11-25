import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AuditLog {
  id: string;
  user_id: string | null;
  event_type: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

export interface AuditLogFilters {
  eventType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.eventType && filters.eventType !== 'all') {
        params.set('eventType', filters.eventType);
      }
      if (filters.status && filters.status !== 'all') {
        params.set('status', filters.status);
      }
      if (filters.startDate) {
        params.set('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.set('endDate', filters.endDate.toISOString());
      }
      if (filters.search) {
        params.set('search', filters.search);
      }

      const queryString = params.toString();
      const endpoint = `/audit-logs${queryString ? `?${queryString}` : ''}`;
      const data = await api.get<AuditLog[]>(endpoint);
      return data;
    },
  });
}

export function useAuditLogEventTypes() {
  return useQuery({
    queryKey: ['audit-log-event-types'],
    queryFn: async () => {
      const data = await api.get<string[]>('/audit-logs/event-types');
      return data;
    },
  });
}
