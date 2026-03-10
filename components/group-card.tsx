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
      <Card className="p-5 flex items-center justify-between border-2 border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all duration-300 rounded-3xl shadow-none hover:shadow-brutalist-sm active:translate-y-0.5 active:shadow-none">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-brand-pink flex items-center justify-center text-slate-950 font-black text-3xl border-2 border-slate-900 overflow-hidden shadow-brutalist-sm group-hover:-translate-y-1 transition-transform">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="font-black tracking-tight text-xl uppercase leading-none group-hover:text-brand-pink transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black bg-brand-yellow text-slate-950 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-slate-900">
                {category}
              </span>
              <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Users className="h-3 w-3 mr-1 stroke-[3]" />
                {memberCount}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right space-y-1">
          <p className={cn(
            "text-lg font-black tracking-tight uppercase leading-none",
            isPositive ? "text-brand-pink" : isNegative ? "text-rose-400" : "text-slate-500"
          )}>
            {isPositive ? "+" : ""}{currency} {Math.abs(userBalance).toFixed(2)}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
            {isPositive ? "Owed to you" : isNegative ? "You owe" : "Settled"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
