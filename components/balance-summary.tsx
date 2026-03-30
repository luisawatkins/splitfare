"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";

type BalanceSummaryProps = {
  netBalance: number;
  currency: string;
  className?: string;
};

export function BalanceSummary({ netBalance, currency, className }: BalanceSummaryProps) {
  const isPositive = netBalance > 0;
  const isNegative = netBalance < 0;
  const isNeutral = netBalance === 0;

  return (
    <Card className={cn(
      "relative overflow-hidden rounded-3xl border-2 p-6 shadow-brutalist transition-all duration-300",
      isPositive && "border-slate-900 bg-brand-pink text-slate-950 dark:border-slate-900",
      isNegative && "border-slate-900 bg-rose-400 text-slate-950 dark:border-slate-900",
      isNeutral && "border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50",
      className
    )}>
      <div className={cn(
        "absolute -bottom-4 -right-4 opacity-10",
        isNeutral ? "text-slate-400 dark:text-slate-500" : "text-slate-950"
      )}>
        <Wallet size={120} strokeWidth={1} />
      </div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-[10px] font-black uppercase tracking-[0.25em]",
            isNeutral ? "text-slate-500 dark:text-slate-400" : "text-slate-950/60"
          )}>
            Your Net Balance
          </p>
          <div className={cn(
            "rounded-xl border-2 p-2 shadow-brutalist-sm",
            isNeutral
              ? "border-slate-300 bg-white text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-400"
              : "border-slate-900 bg-white/40 text-slate-950"
          )}>
            {isPositive ? <ArrowUpRight size={18} strokeWidth={3} /> : isNegative ? <ArrowDownLeft size={18} strokeWidth={3} /> : <Wallet size={18} strokeWidth={3} />}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className={cn(
            "text-5xl font-black uppercase leading-none tracking-tighter",
            isNeutral ? "text-slate-900 dark:text-slate-50" : "text-slate-950"
          )}>
            {isNegative ? "-" : ""}{currency} {Math.abs(netBalance).toFixed(2)}
          </h2>
          <p className={cn(
            "text-xs font-bold uppercase tracking-wider",
            isNeutral ? "text-slate-600 dark:text-slate-400" : "text-slate-950/80"
          )}>
            {isPositive && "You are owed by the group"}
            {isNegative && "You owe the group"}
            {isNeutral && "You are all settled up!"}
          </p>
        </div>
      </div>
    </Card>
  );
}
