"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Receipt, Sparkles } from "lucide-react";

type ExpenseRow = {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  paidBy: string;
  date: string;
};

const MOCK_ROWS: ExpenseRow[] = [
  {
    id: "1",
    description: "Brunch at Sora",
    category: "Food",
    amount: 58.2,
    currency: "USD",
    paidBy: "Alex",
    date: "Today",
  },
  {
    id: "2",
    description: "Metro passes",
    category: "Travel",
    amount: 24.5,
    currency: "USD",
    paidBy: "Mia",
    date: "Today",
  },
  {
    id: "3",
    description: "Monthly rent transfer",
    category: "Rent",
    amount: 1340,
    currency: "USD",
    paidBy: "Priya",
    date: "Yesterday",
  },
  {
    id: "4",
    description: "Wi-Fi + utilities",
    category: "Utilities",
    amount: 126.9,
    currency: "USD",
    paidBy: "Noah",
    date: "Mar 28",
  },
];

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

export default function ExpensesPage() {
  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", "Food", "Travel", "Rent", "Utilities"],
    []
  );
  const rows = useMemo(() => {
    if (activeCategory === "All") return MOCK_ROWS;
    return MOCK_ROWS.filter((row) => row.category === activeCategory);
  }, [activeCategory]);

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
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
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
                            CHIP_CLASSES[row.category]
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
