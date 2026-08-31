import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-purple-600/25 hover:bg-primary/90 hover:shadow-purple-600/40",
        secondary:
          "bg-white/10 text-slate-100 hover:bg-white/15 border border-white/10 backdrop-blur-md",
        outline:
          "border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-foreground hover:border-white/30 backdrop-blur-sm",
        ghost: "hover:bg-white/10 text-foreground",
        glow: "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/45 hover:brightness-110 border border-purple-400/30",
        sunset: "bg-gradient-to-r from-rose-500 via-purple-600 to-violet-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 border border-rose-400/30",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-2xl px-8 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
