import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[#054030] shadow-[0_4px_14px_0_rgba(6,78,59,0.2)] hover:shadow-[0_6px_20px_rgba(6,78,59,0.3)]",
        fresh:
          "bg-[#10B981] text-white hover:bg-[#0ea572] shadow-[0_4px_14px_0_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)]",
        gold:
          "bg-[#D4AF37] text-[#1F2937] font-bold hover:bg-[#c29f2d] shadow-[0_4px_14px_0_rgba(212,175,55,0.3)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-border/80 bg-card text-foreground hover:bg-secondary/50 hover:border-primary/30 shadow-sm",
        secondary:
          "bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-[#bbf7d0] dark:hover:bg-emerald-900/50 shadow-sm",
        ghost:
          "hover:bg-secondary/60 text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-7 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
