import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";

  const variants: Record<BadgeVariant, string> = {
    default:
      "border-transparent bg-primary text-primary-foreground shadow-sm",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground shadow-sm",
    outline: "border-border bg-background text-foreground",
    success:
      "border-transparent bg-emerald-500/10 text-emerald-400 shadow-sm",
    warning:
      "border-transparent bg-amber-500/10 text-amber-400 shadow-sm"
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props} />
  );
}
