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
      "p-6 border-none shadow-xl overflow-hidden relative transition-all duration-300",
      isPositive && "bg-emerald-500 text-emerald-50",
      isNegative && "bg-rose-500 text-rose-50",
      isNeutral && "bg-slate-800 text-slate-50",
      className
    )}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Wallet size={100} />
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Your Net Balance</p>
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            {isPositive ? <ArrowUpRight size={16} /> : isNegative ? <ArrowDownLeft size={16} /> : <Wallet size={16} />}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">
            {isNegative ? "-" : ""}{currency} {Math.abs(netBalance).toFixed(2)}
          </h2>
          <p className="text-sm font-medium opacity-90">
            {isPositive && "You are owed by the group"}
            {isNegative && "You owe the group"}
            {isNeutral && "You are all settled up!"}
          </p>
        </div>
      </div>
    </Card>
  );
}
