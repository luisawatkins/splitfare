"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Receipt, Search, SearchX } from "lucide-react";

function matchesQuery(haystack: string | null | undefined, q: string) {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(q);
}

const MOCK_GROUPS = [
  { id: "g1", name: "Lisbon Trip", description: "Summer travel crew", category: "Travel", invite_code: "LIS24" },
  { id: "g2", name: "Apartment 24B", description: "Roommates and utilities", category: "Rent", invite_code: "APT24" },
];

const MOCK_EXPENSES = [
  { id: "e1", groupId: "g1", groupName: "Lisbon Trip", description: "Train passes", category: "Travel", paidByName: "Alex", total_amount: 56, currency: "USD" },
  { id: "e2", groupId: "g2", groupName: "Apartment 24B", description: "Electricity bill", category: "Utilities", paidByName: "Mia", total_amount: 92.2, currency: "USD" },
];

export default function SearchPage() {
  const reduceMotion = useReducedMotion();
  const [rawQuery, setRawQuery] = useState("");
  const q = rawQuery.trim().toLowerCase();

  const matchedGroups = useMemo(() => {
    if (!q) return [];
    return MOCK_GROUPS.filter(
      (g) =>
        matchesQuery(g.name, q) ||
        matchesQuery(g.description, q) ||
        matchesQuery(g.category, q) ||
        matchesQuery(g.invite_code, q)
    );
  }, [q]);

  const matchedExpenses = useMemo(() => {
    if (!q) return [];
    return MOCK_EXPENSES.filter(
      (e) =>
        matchesQuery(e.description, q) ||
        matchesQuery(e.groupName, q) ||
        matchesQuery(e.paidByName, q) ||
        matchesQuery(e.category, q)
    );
  }, [q]);
  const hasQuery = q.length > 0;
  const noMatches =
    hasQuery && matchedGroups.length === 0 && matchedExpenses.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      <header className="mb-6 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">Find</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Search</h1>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            size={20}
            strokeWidth={2.5}
          />
          <input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Groups, expenses, invite code…"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </header>

      {!hasQuery ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-violet-600 dark:border-slate-700 dark:bg-slate-900 dark:text-violet-400">
            <Search size={28} />
          </div>
          <p className="max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
            Search by group name, description, category, invite code, expense
            title, or who paid.
          </p>
        </motion.div>
      ) : noMatches ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white py-20 dark:border-slate-600 dark:bg-slate-900/60"
        >
          <SearchX className="h-12 w-12 text-slate-400 dark:text-slate-500" />
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No matches
          </p>
          <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Try another keyword or check spelling.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8 pb-8">
          {matchedGroups.length > 0 && (
            <section className="space-y-3">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Groups
              </h2>
              <div className="space-y-2">
                {matchedGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: 0.3 }}
                  >
                      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {group.name}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {group.category}
                            </span>
                            {group.description ? (
                              <span className="max-w-[200px] truncate text-xs text-slate-500 dark:text-slate-400">
                                {group.description}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {matchedExpenses.length > 0 && (
            <section className="space-y-3">
              <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Expenses
              </h2>
              <div className="space-y-2">
                {matchedExpenses.map((row, index) => {
                  return (
                    <motion.div
                      key={`${row.groupId}-${row.id}`}
                      initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: 0.3 }}
                    >
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <Receipt size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {row.description}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {row.category}
                              </span>
                              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {row.paidByName
                                  ? ` · ${row.paidByName}`
                                  : ""}
                                {" · "}
                                {row.groupName}
                              </span>
                            </div>
                          </div>
                          <p className="shrink-0 font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {row.total_amount.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{" "}
                            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400">
                              {row.currency}
                            </span>
                          </p>
                        </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
