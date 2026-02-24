import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionClick,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/40 px-6 py-8 text-center",
        className
      )}
    >
      {icon && <div className="text-3xl text-muted-foreground">{icon}</div>}
      <div className="space-y-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {actionLabel && onActionClick && (
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={onActionClick}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

