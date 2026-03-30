"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Receipt } from "lucide-react";

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

const FILTERS = ["All", "Expenses", "Settlements"] as const;
type Filter = (typeof FILTERS)[number];

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "expense",
    title: "Groceries",
    groupName: "Apartment 24B",
    amount: 82.1,
    currency: "USD",
    dateLabel: "2h ago",
    status: "completed",
  },
  {
    id: "a2",
    type: "settlement",
    title: "Settlement from Mia",
    groupName: "Lisbon Trip",
    amount: 44.13,
    currency: "USD",
    dateLabel: "Yesterday",
    status: "completed",
  },
  {
    id: "a3",
    type: "settlement",
    title: "Pending settlement",
    groupName: "Apartment 24B",
    amount: 27.0,
    currency: "USD",
    dateLabel: "Mar 28",
    status: "pending",
  },
];

export default function ActivityPage() {
  const reduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const filtered = useMemo(() => MOCK_ACTIVITY.filter((item) => {
    if (activeFilter === "Expenses") return item.type === "expense";
    if (activeFilter === "Settlements") return item.type === "settlement";
    return true;
  }), [activeFilter]);

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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
