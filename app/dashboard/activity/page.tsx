"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Receipt } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { resolvePrivyAccessToken, SIGN_IN_REQUIRED } from "@/lib/privy-token";
import {
  fetchExpensesAcrossGroups,
  type CrossGroupExpenseRow,
} from "@/lib/cross-group-expenses";
import { Button } from "@/components/ui/button";

type ActivityItem = {
  id: string;
  type: "expense" | "settlement";
  title: string;
  groupName: string;
  amount: number;
  currency: string;
  dateLabel: string;
  status: "completed" | "pending";
};

type GroupLite = {
  id: string;
  name: string;
  currency?: string | null;
};

type SettlementRow = {
  id: string;
  group_id: string;
  amount: number | string;
  currency?: string | null;
  status?: string | null;
  created_at: string;
  payer?: { id?: string; name?: string | null } | null;
  payee?: { id?: string; name?: string | null } | null;
};

const FILTERS = ["All", "Expenses", "Settlements"] as const;
type Filter = (typeof FILTERS)[number];

function toRelativeDateLabel(iso: string) {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "Recently";
  const diffMs = Date.now() - value.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfDate.getTime()) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ActivityPage() {
  const reduceMotion = useReducedMotion();
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["activity-page-data"],
    queryFn: async () => {
      const token = await resolvePrivyAccessToken(getAccessToken);
      if (!token) {
        throw new Error(SIGN_IN_REQUIRED);
      }

      const groupsRes = await fetch("/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const groupsJson = await groupsRes.json();
      if (!groupsRes.ok || !groupsJson.success) {
        throw new Error(groupsJson?.error?.message || "Failed to load groups");
      }
      const groups = (groupsJson.data ?? []) as GroupLite[];
      const groupMap = new Map(groups.map((g) => [g.id, g]));

      const [expenseRows, settlementsRes] = await Promise.all([
        fetchExpensesAcrossGroups(token, groups),
        fetch("/api/settlements", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const settlementsJson = await settlementsRes.json();
      if (!settlementsRes.ok || !settlementsJson.success) {
        throw new Error(settlementsJson?.error?.message || "Failed to load settlements");
      }

      const expenseActivity: Array<ActivityItem & { timestamp: string }> = (
        expenseRows as CrossGroupExpenseRow[]
      ).map((row) => ({
        id: `expense-${row.id}`,
        type: "expense",
        title: row.description?.trim() || "Expense",
        groupName: row.groupName || "Group",
        amount: Number(row.total_amount),
        currency: row.currency || "USDC",
        dateLabel: toRelativeDateLabel(row.created_at),
        status: "completed",
        timestamp: row.created_at,
      }));

      const settlementActivity: Array<ActivityItem & { timestamp: string }> = (
        (settlementsJson.data ?? []) as SettlementRow[]
      ).map((row) => {
        const status = row.status === "pending" ? "pending" : "completed";
        const amount = Number(row.amount ?? 0);
        const payerName = row.payer?.name?.trim() || "Someone";
        const title = status === "pending" ? "Pending settlement" : `Settlement from ${payerName}`;
        return {
          id: `settlement-${row.id}`,
          type: "settlement",
          title,
          groupName: groupMap.get(row.group_id)?.name ?? "Group",
          amount,
          currency: row.currency || groupMap.get(row.group_id)?.currency || "USDC",
          dateLabel: toRelativeDateLabel(row.created_at),
          status,
          timestamp: row.created_at,
        };
      });

      const allActivity = [...expenseActivity, ...settlementActivity].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return allActivity;
    },
    enabled: ready && authenticated,
    retry: false,
  });

  const activity = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () =>
      activity.filter((item) => {
        if (activeFilter === "Expenses") return item.type === "expense";
        if (activeFilter === "Settlements") return item.type === "settlement";
        return true;
      }),
    [activity, activeFilter]
  );

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
          <div className="h-10 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 text-center sm:px-6 sm:pt-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Sign in to view recent activity
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your latest expenses and settlements appear here.
          </p>
          <Button className="mt-5" onClick={() => login()}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl space-y-3 px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error) {
    const needsSignIn = error instanceof Error && error.message === SIGN_IN_REQUIRED;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 text-center sm:px-6 sm:pt-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Could not load activity
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {needsSignIn
              ? "Your session expired. Sign in again to continue."
              : "Please retry to refresh your latest activity."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            {needsSignIn && <Button onClick={() => login()}>Sign in</Button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-6"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Recent Activity</h1>
        </motion.header>

        <div className="mb-5 flex rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter
                  ? "bg-violet-600 text-white dark:bg-violet-600"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeFilter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {filtered.map((item, index) => (
              <motion.article
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: reduceMotion ? 0 : index * 0.08 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {item.type === "expense" ? <Receipt className="h-5 w-5" /> : item.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.groupName} • {item.dateLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {item.type === "settlement" ? "+" : ""}{item.currency} {item.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
            {!filtered.length && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No activity for this filter yet.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
