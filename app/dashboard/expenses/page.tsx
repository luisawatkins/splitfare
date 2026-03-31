"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Receipt, Sparkles } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { resolvePrivyAccessToken, SIGN_IN_REQUIRED } from "@/lib/privy-token";
import {
  fetchExpensesAcrossGroups,
  type CrossGroupExpenseRow,
} from "@/lib/cross-group-expenses";

type ExpenseRow = {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  paidBy: string;
  date: string;
};

type GroupLite = {
  id: string;
  name: string;
  currency?: string | null;
};

const CHIP_CLASSES: Record<string, string> = {
  Food:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:border-orange-800/60",
  Travel:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800/60",
  Rent:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-800/60",
  Utilities:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800/60",
};

function toTitleCase(value: string) {
  if (!value) return "Other";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function toRelativeDateLabel(iso: string) {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "Recently";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfDate.getTime()) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ExpensesPage() {
  const reduceMotion = useReducedMotion();
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-expenses-data"],
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
      const expenseRows = await fetchExpensesAcrossGroups(token, groups);
      const uiRows: ExpenseRow[] = (expenseRows as CrossGroupExpenseRow[]).map((row) => ({
        id: row.id,
        description: row.description?.trim() || "Expense",
        category: toTitleCase(row.category),
        amount: Number(row.total_amount),
        currency: row.currency || "USDC",
        paidBy: row.paidByName || "Unknown",
        date: toRelativeDateLabel(row.created_at),
      }));
      return uiRows;
    },
    enabled: ready && authenticated,
    retry: false,
  });

  const liveRows = useMemo(() => data ?? [], [data]);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(liveRows.map((row) => row.category)))],
    [liveRows]
  );
  const rows = useMemo(() => {
    if (activeCategory === "All") return liveRows;
    return liveRows.filter((row) => row.category === activeCategory);
  }, [activeCategory, liveRows]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
          <div className="h-10 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 text-center sm:px-6 sm:pt-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Sign in to view expenses
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your latest shared expenses appear here.
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
        <div className="mx-auto w-full max-w-6xl space-y-3 px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
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
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 text-center sm:px-6 sm:pt-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Could not load expenses
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {needsSignIn
              ? "Your session expired. Sign in again to continue."
              : "Please retry and we will refresh your latest expenses."}
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
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-6 flex items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Overview</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Expenses
            </h1>
          </div>
          <Link
            href="/groups"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </motion.header>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.08, ease: "easeOut" }}
          className="mb-4 flex gap-2 overflow-x-auto pb-1"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                activeCategory === category
                  ? "border-violet-600 bg-violet-600 text-white dark:border-violet-500"
                  : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {rows.length === 0 ? (
            <motion.section
              key="empty"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nothing here yet</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Try a different filter or add your first expense.
              </p>
              <button
                type="button"
                className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Add Expense
              </button>
            </motion.section>
          ) : (
            <motion.section
              key="list"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              className="space-y-3"
            >
              {rows.map((row, index) => (
                <motion.article
                  key={row.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: reduceMotion ? 0 : index * 0.08,
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {row.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                            CHIP_CLASSES[row.category] ||
                            "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {row.category}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {row.date} • Paid by {row.paidBy}
                        </span>
                      </div>
                    </div>
                    <p className="min-w-[110px] text-right font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {row.currency} {row.amount.toFixed(2)}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
