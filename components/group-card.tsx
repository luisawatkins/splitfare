"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type GroupCardProps = {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  userBalance: number;
  currency: string;
  avatarUrl?: string | null;
};

export function GroupCard({
  id,
  name,
  category,
  memberCount,
  userBalance,
  currency,
  avatarUrl,
}: GroupCardProps) {
  const isPositive = userBalance > 0;
  const isNegative = userBalance < 0;

  return (
    <Link href={`/groups/${id}`} className="block group">
      <Card className="p-4 flex items-center justify-between border-border/50 hover:bg-muted/30 transition-all duration-300 rounded-3xl shadow-sm hover:shadow-md active:scale-[0.98]">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border border-primary/20 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-black tracking-tight text-lg leading-tight group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-black bg-slate-100 dark:bg-slate-800 border-none uppercase tracking-tighter">
                {category}
              </Badge>
              <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Users className="h-3 w-3 mr-1" />
                {memberCount}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right space-y-0.5">
          <p className={cn(
            "text-sm font-black tracking-tight",
            isPositive ? "text-emerald-500" : isNegative ? "text-rose-500" : "text-muted-foreground"
          )}>
            {isPositive ? "+" : ""}{currency} {Math.abs(userBalance).toFixed(2)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40">
            {isPositive ? "Owed to you" : isNegative ? "You owe" : "Settled"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
