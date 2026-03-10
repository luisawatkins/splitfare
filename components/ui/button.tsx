import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-black uppercase tracking-[0.15em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:translate-y-0.5 active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-brand-pink text-slate-950 border-2 border-slate-900 shadow-brutalist hover:bg-brand-pink/90 hover:shadow-brutalist-lg",
        outline:
          "border-2 border-slate-800 bg-transparent text-slate-200 hover:bg-slate-900 hover:border-slate-700",
        ghost: "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
        secondary:
          "bg-brand-yellow text-slate-950 border-2 border-slate-900 shadow-brutalist-sm hover:bg-brand-yellow/90",
        destructive:
          "bg-rose-500 text-slate-50 border-2 border-slate-900 shadow-brutalist-sm hover:bg-rose-600"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-xl px-4 text-[10px]",
        lg: "h-14 rounded-full px-10 text-base",
        icon: "h-10 w-10 rounded-xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref as never}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

