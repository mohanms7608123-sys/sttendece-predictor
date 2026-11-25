import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { OrderStatus } from "@/types/database";

interface OrderStepperProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStepper({ status, className }: OrderStepperProps) {
  const steps = [
    { id: 'placed', label: 'Placed' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'collected', label: 'Collected' },
  ];

  const statusOrder = ['placed', 'accepted', 'preparing', 'ready', 'collected'];

  if (status === 'cancelled' || (status as string) === 'rejected') {
    return (
      <div className="w-full py-4 bg-red-50 dark:bg-red-950/40 rounded-2xl text-center border border-red-200">
        <p className="text-destructive font-bold text-sm">Order {status === 'cancelled' ? 'Cancelled' : 'Rejected'}</p>
      </div>
    );
  }

  const currentStepIndex = statusOrder.indexOf(status);

  return (
    <div className={cn("w-full py-3", className)}>
      <div className="relative flex items-center justify-between">
        {/* Connecting Line - Background */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full -z-10" />

        {/* Connecting Line - Progress */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#10B981] rounded-full -z-10 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, (currentStepIndex / (steps.length - 1)) * 92))}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 group relative">
              {/* Circle Indicator */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-card",
                  isCurrent
                    ? "bg-[#064E3B] border-[#D4AF37] text-white shadow-md shadow-[#064E3B]/30 scale-110"
                    : isCompleted
                    ? "bg-[#10B981] border-[#10B981] text-white shadow-sm"
                    : "border-border text-muted-foreground/40"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap mt-1",
                  isCurrent
                    ? "text-[#064E3B] dark:text-emerald-300 font-black"
                    : isCompleted
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground/60"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
