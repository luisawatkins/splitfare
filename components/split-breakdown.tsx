"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
import { CheckCircle2, Circle } from "lucide-react";

interface SplitMember {
  id: string;
  user_id: string;
  amount_owed: number;
  percentage_owed?: number;
  shares?: number;
  is_settled?: boolean; // We'll need this in the schema eventually
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface SplitBreakdownProps {
  splits: SplitMember[];
  totalAmount: number;
  currency?: string;
}

export function SplitBreakdown({ splits, totalAmount, currency = "USDC" }: SplitBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Split Breakdown
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground opacity-60">
          {splits.length} Members
        </span>
      </div>

      <div className="grid gap-2">
        {splits.map((split) => {
          const isSettled = split.is_settled;
          
          return (
            <div 
              key={split.id} 
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border transition-colors",
                isSettled 
                  ? "bg-emerald-500/5 border-emerald-500/10" 
                  : "bg-muted/30 border-border/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar 
                  src={split.user.avatar_url || undefined} 
                  fallback={split.user.name.slice(0, 2).toUpperCase()}
                  className="h-8 w-8"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold truncate max-w-[120px]">
                    {split.user.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {split.percentage_owed && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {Number(split.percentage_owed)}%
                      </span>
                    )}
                    {split.shares && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {split.shares} {split.shares === 1 ? 'share' : 'shares'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-black">
                    {formatCurrency(Number(split.amount_owed))}
                  </p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isSettled ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {isSettled ? "Settled" : "Pending"}
                  </p>
                </div>
                {isSettled ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-amber-500 opacity-20" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
