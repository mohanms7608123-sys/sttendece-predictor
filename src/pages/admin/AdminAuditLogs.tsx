import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { AdminSubNav } from '@/components/layout/AdminSubNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditLogs, useAuditLogEventTypes, AuditLogFilters } from '@/hooks/useAuditLogs';
import { format } from 'date-fns';
import {
  Search, Filter, RefreshCw, Shield, AlertTriangle,
  CheckCircle, XCircle, Info, Calendar, Sparkles
} from 'lucide-react';

const STATUS_ICONS: Record<string, React.ElementType> = {
  success: CheckCircle,
  failure: XCircle,
  error: AlertTriangle,
  info: Info,
};

const STATUS_COLORS: Record<string, string> = {
  success: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]/30 dark:bg-emerald-950/50 dark:text-emerald-300',
  failure: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  error: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  info: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300',
};

export default function AdminAuditLogs() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [searchInput, setSearchInput] = useState('');

  const { data: logs, isLoading, refetch, isRefetching } = useAuditLogs(filters);
  const { data: eventTypes } = useAuditLogEventTypes();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      action: searchInput || undefined
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="space-y-6 pt-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack>
      <div className="space-y-6 pt-2 pb-12">
        {/* Sub-Navigation Bar */}
        <AdminSubNav />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-1.5">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" />
              <span>SECURITY & AUDIT TRAIL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
              System Audit Logs
            </h1>
            <p className="text-xs text-muted-foreground">
              Trace chronological security actions, kitchen status modifications, and payment events
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="rounded-xl text-xs font-bold h-10 px-4 border-border/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh Trail
          </Button>
        </div>

        {/* Filter Card */}
        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-xs font-bold text-foreground">Search Activity</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search action or resource..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
                <Button onClick={handleSearch} className="h-11 px-4 bg-[#064E3B] text-white rounded-xl text-xs font-bold">
                  Filter
                </Button>
              </div>
            </div>

            {/* Event Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Event Category</Label>
              <Select
                value={filters.eventType || 'all'}
                onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, eventType: value === 'all' ? undefined : value }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl text-xs">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All categories</SelectItem>
                  {eventTypes?.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Result Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl text-xs">
                  <SelectValue placeholder="All results" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All results</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full h-11 rounded-xl text-xs font-bold border-border/80 hover:bg-muted/60"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Table */}
        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <CardHeader className="p-5 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display font-bold">
                {isLoading ? 'Loading records...' : `${logs?.length || 0} Audit Trail Events`}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            ) : logs?.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="h-14 w-14 bg-muted/60 rounded-3xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-7 w-7 text-muted-foreground/60" />
                </div>
                <h3 className="text-base font-bold text-foreground">No audit logs matching query</h3>
                <p className="text-xs mt-1">Try resetting your filter parameters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Metadata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs?.map((log) => {
                      const StatusIcon = STATUS_ICONS[log.status] || Info;
                      const statusColor = STATUS_COLORS[log.status] || STATUS_COLORS.info;

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <Calendar className="h-3.5 w-3.5 text-[#10B981]" />
                              <div>
                                <div className="text-xs font-bold text-foreground">
                                  {format(new Date(log.created_at), 'MMM d, yyyy')}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {format(new Date(log.created_at), 'h:mm:ss a')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-[10px] rounded-lg">
                              {log.event_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-bold text-foreground">{log.action}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                              <StatusIcon className="h-3 w-3" />
                              {log.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {log.resource_type && (
                              <div className="text-xs">
                                <span className="font-bold text-[10px] uppercase text-muted-foreground">{log.resource_type}</span>
                                {log.resource_id && (
                                  <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[100px]">
                                    #{log.resource_id.substring(0, 8)}
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.metadata && Object.keys(log.metadata as object).length > 0 && (
                              <details className="cursor-pointer">
                                <summary className="text-[11px] text-[#064E3B] dark:text-emerald-400 font-bold hover:underline list-none">
                                  Inspect JSON
                                </summary>
                                <div className="absolute z-20 mt-1 min-w-[220px] bg-card text-foreground shadow-xl rounded-2xl border border-border p-3 text-[10px]">
                                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              </details>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
