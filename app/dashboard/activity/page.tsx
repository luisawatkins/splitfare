"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { usePrivy } from "@privy-io/react-auth";
import { History, Receipt, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/cn";
import { useState } from "react";
import Link from "next/link";

type ActivityItem = {
  id: string;
  type: "expense" | "settlement";
  title: string;
  groupName: string;
  groupId: string;
  amount: number;
  currency: string;
  date: string;
  isOwed: boolean;
  status?: string;
  paidBy?: string;
};

const FILTERS = ["All", "Expenses", "Settlements"] as const;
type Filter = (typeof FILTERS)[number];

export default function ActivityPage() {
  const { getAccessToken } = usePrivy();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (token) apiClient.setToken(token);
      return apiClient.groups.list();
    },
  });

  const { data: allActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["all-activity", groups?.map((g) => g.id)],
    enabled: !!groups && groups.length > 0,
    queryFn: async () => {
      const items: ActivityItem[] = [];

      await Promise.all(
        (groups ?? []).map(async (group) => {
          if (!group.id || !group.name) return;
          try {
            const expenses = await apiClient.expenses.list(group.id as string);
            expenses.forEach((e: any) => {
              items.push({
                id: e.id,
                type: "expense",
                title: e.description || "Expense",
                groupName: group.name as string,
                groupId: group.id as string,
                amount: e.amount,
                currency: e.currency || group.currency || "USDC",
                date: e.created_at,
                isOwed: false,
                paidBy: e.paid_by,
              });
            });
          } catch { }

          try {
            const settlements = await apiClient.settlements.list(group.id as string);
            settlements.forEach((s: any) => {
              items.push({
                id: s.id,
                type: "settlement",
                title: "Settlement",
                groupName: group.name as string,
                groupId: group.id as string,
                amount: s.amount,
                currency: s.currency || group.currency || "USDC",
                date: s.created_at,
                isOwed: false,
                status: s.status,
              });
            });
          } catch { }
        })
      );

      return items.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
  });

  const isLoading = groupsLoading || activityLoading;

  const filtered = (allActivity ?? []).filter((item) => {
    if (activeFilter === "Expenses") return item.type === "expense";
    if (activeFilter === "Settlements") return item.type === "settlement";
    return true;
  });

  return (
    <div className="container max-w-2xl py-10 space-y-8 min-h-screen bg-slate-950">
      {/* Header */}
      <header className="px-2 space-y-1">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
          Overview
        </p>
        <h1 className="text-3xl font-black tracking-tight uppercase text-slate-50">
          Recent Activity
        </h1>
      </header>

      {/* Filter pills */}
      <div className="flex p-1 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-brutalist-sm">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeFilter === f
                ? "bg-brand-pink text-slate-950 shadow-brutalist-sm"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-full bg-slate-900 animate-pulse rounded-3xl border-2 border-slate-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-6 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem]"
        >
          <History className="h-14 w-14 stroke-[3] text-brand-pink" />
          <div className="text-center space-y-1">
            <p className="text-slate-50 font-black uppercase tracking-wide text-lg">
              No Activity Yet
            </p>
            <p className="text-slate-500 text-sm font-medium">
              Add expenses to your groups to see them here.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Link href={`/groups/${item.groupId}`}>
                <div className="flex items-center gap-4 p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl hover:border-slate-700 hover:bg-slate-900/80 active:translate-y-0.5 transition-all duration-200 shadow-brutalist-sm">
                  {/* Icon */}
                  <div
                    className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border-2 shrink-0",
                      item.type === "expense"
                        ? "bg-brand-pink/10 border-brand-pink/20 text-brand-pink"
                        : item.status === "completed"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}
                  >
                    {item.type === "expense" ? (
                      <Receipt size={20} className="stroke-[3]" />
                    ) : item.status === "completed" ? (
                      <CheckCircle2 size={20} className="stroke-[3]" />
                    ) : (
                      <Clock size={20} className="stroke-[3]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-50 font-black text-sm truncate uppercase tracking-wide">
                      {item.title}
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium truncate">
                      {item.groupName} ·{" "}
                      {formatDistanceToNow(new Date(item.date), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-sm font-black",
                        item.type === "settlement"
                          ? "text-emerald-400"
                          : "text-slate-50"
                      )}
                    >
                      {item.type === "settlement" ? "+" : ""}
                      {item.amount} {item.currency}
                    </p>
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        item.type === "expense"
                          ? "bg-brand-pink/10 text-brand-pink border-brand-pink/20"
                          : item.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}
                    >
                      {item.type === "expense"
                        ? "Expense"
                        : item.status ?? "Pending"}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
