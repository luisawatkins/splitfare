import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AmountDisplayProps = HTMLAttributes<HTMLSpanElement> & {
  cents: number;
  currency?: string;
  locale?: string;
};

export function AmountDisplay({
  cents,
  currency = "USD",
  locale = "en-US",
  className,
  ...props
}: AmountDisplayProps) {
  const value = cents / 100;

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  return (
    <span className={cn("tabular-nums", className)} {...props}>
      {formatted}
    </span>
  );
}

