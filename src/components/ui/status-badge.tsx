import { OrderStatus } from '@/types/database';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, ChefHat, Bell, Package, XCircle } from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; className: string }> = {
  placed: {
    label: 'Placed',
    icon: Clock,
    className: 'bg-[#F3F4F6] text-[#1F2937] border border-[#1F2937]/15 dark:bg-zinc-800 dark:text-zinc-200',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    className: 'bg-[#E0F2FE] text-[#0369A1] border border-[#0284C7]/25 dark:bg-sky-950/50 dark:text-sky-300',
  },
  preparing: {
    label: 'Preparing',
    icon: ChefHat,
    className: 'bg-[#FFFBEB] text-[#92400E] border border-[#D4AF37]/50 dark:bg-amber-950/40 dark:text-amber-300',
  },
  ready: {
    label: 'Ready for Pickup!',
    icon: Bell,
    className: 'bg-[#D1FAE5] text-[#065F46] border border-[#10B981]/40 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold',
  },
  collected: {
    label: 'Collected',
    icon: Package,
    className: 'bg-[#064E3B] text-white border border-[#064E3B] shadow-sm',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300',
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.placed;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full',
    md: 'text-xs px-3 py-1 rounded-full font-semibold',
    lg: 'text-sm px-4 py-1.5 rounded-full font-bold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  // Dynamic animations based on status
  const animationClass =
    status === 'preparing' ? 'animate-pulse' :
      status === 'ready' ? 'animate-bounce' : '';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-all select-none',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} className={cn(animationClass)} />
      {config.label}
    </span>
  );
}
