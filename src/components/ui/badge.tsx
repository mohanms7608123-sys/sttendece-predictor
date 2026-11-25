import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#064E3B] text-white shadow-sm",
        secondary: "border-transparent bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/40 dark:text-emerald-300 font-medium",
        fresh: "border-[#10B981]/30 bg-[#10B981]/15 text-[#065F46] dark:text-[#34D399]",
        gold: "border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#927315] dark:text-[#F3D573] font-bold",
        destructive: "border-transparent bg-destructive/15 text-destructive font-medium",
        outline: "border-border/80 text-foreground bg-card/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
