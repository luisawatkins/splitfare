"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Plus,
  Receipt,
  Sparkles,
  Wallet,
  Utensils,
  Car,
  Zap,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

type Person = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: string;
  createdAt: string;
};

type Group = {
  id: string;
  name: string;
  members: Person[];
  balance: number;
  currency: string;
};

const MOCK_GROUPS: Group[] = [
  {
    id: "g1",
    name: "Lisbon Trip",
    currency: "USD",
    balance: 182.4,
    members: [
      { id: "u1", name: "Alex Kim" },
      { id: "u2", name: "Priya Patel" },
      { id: "u3", name: "Noah Smith" },
    ],
  },
  {
    id: "g2",
    name: "Apartment 24B",
    currency: "USD",
    balance: -94.7,
    members: [
      { id: "u1", name: "Alex Kim" },
      { id: "u4", name: "Mia Wong" },
      { id: "u5", name: "Leo Garcia" },
    ],
  },
];

const MOCK_EXPENSES: Expense[] = [
  {
    id: "e1",
    description: "Dinner at Fado Club",
    amount: 124.6,
    currency: "USD",
    category: "Food",
    paidBy: "Priya Patel",
    createdAt: "Today",
  },
  {
    id: "e2",
    description: "Airport Taxi",
    amount: 48.0,
    currency: "USD",
    category: "Travel",
    paidBy: "Alex Kim",
    createdAt: "Today",
  },
  {
    id: "e3",
    description: "Electricity Bill",
    amount: 92.2,
    currency: "USD",
    category: "Utilities",
    paidBy: "Mia Wong",
    createdAt: "Yesterday",
  },
];

const CATEGORY_STYLES: Record<
  string,
  { chip: string; stripe: string; iconWrap: string; Icon: typeof Utensils }
> = {
  Food: {
    chip: "bg-orange-50 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200",
    stripe: "bg-orange-400",
    iconWrap: "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300",
    Icon: Utensils,
  },
  Travel: {
    chip: "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200",
    stripe: "bg-sky-400",
    iconWrap: "bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300",
    Icon: Car,
  },
  Utilities: {
    chip: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
    stripe: "bg-emerald-400",
    iconWrap: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
    Icon: Zap,
  },
  Rent: {
    chip: "bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200",
    stripe: "bg-violet-400",
    iconWrap: "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
    Icon: Wallet,
  },
  Shopping: {
    chip: "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
    stripe: "bg-rose-400",
    iconWrap: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
    Icon: Receipt,
  },
};

const AVATAR_COLORS = [
  "bg-violet-200 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100",
  "bg-indigo-200 text-indigo-900 dark:bg-indigo-500/30 dark:text-indigo-100",
  "bg-cyan-200 text-cyan-900 dark:bg-cyan-500/30 dark:text-cyan-100",
  "bg-emerald-200 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100",
  "bg-fuchsia-200 text-fuchsia-900 dark:bg-fuchsia-500/30 dark:text-fuchsia-100",
  "bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name: string) {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function CountUp({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (reduceMotion) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = shown;
    const delta = value - from;
    const duration = 300;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(from + delta * t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, shown, value]);

  return <>{shown.toFixed(2)}</>;
}

export default function DashboardPage() {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<"overview" | "balances">("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pulseFab, setPulseFab] = useState(true);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setTimeout(() => setPulseFab(false), 1250);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const total = useMemo(
    () => MOCK_GROUPS.reduce((sum, group) => sum + group.balance, 0),
    []
  );
  const owed = useMemo(
    () => MOCK_GROUPS.filter((group) => group.balance > 0).length,
    []
  );

  const defaultCat = CATEGORY_STYLES.Food;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,rgba(139,92,246,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,rgba(139,92,246,0.18),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_40%,rgba(99,102,241,0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_100%_40%,rgba(99,102,241,0.12),transparent)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-7 sm:px-6 sm:pt-10">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-[13px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
              Welcome back
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-slate-900 via-violet-800 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:via-violet-200 dark:to-indigo-200">
                Splitfare
              </span>
            </h1>
          </div>
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-4 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-slate-600"
          >
            This month
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </motion.header>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.05 }}
          className="relative mb-8 overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90"
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 to-indigo-600" />
          <div className="p-6 pl-7 sm:p-7 sm:pl-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Total balance
                </p>
                <p className="mt-2 font-mono text-4xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white sm:text-[2.75rem]">
                  <span className="text-[0.65em] font-medium text-slate-400 dark:text-slate-500">
                    USD
                  </span>{" "}
                  <CountUp value={total} />
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-[13px] font-medium text-white">
                <TrendingUp className="h-4 w-4 opacity-90" />
                {owed} {owed === 1 ? "group" : "groups"} owe you
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mb-8 flex rounded-full border border-slate-200/90 bg-slate-100/80 p-1.5 dark:border-slate-800 dark:bg-slate-900/80">
          {(["overview", "balances"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`relative flex-1 rounded-full px-4 py-2.5 text-[13px] font-semibold capitalize transition-colors ${
                tab === value
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              {tab === value && (
                <motion.span
                  layoutId="dash-tab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{value}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "overview" ? (
            <motion.div
              key="overview"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {MOCK_EXPENSES.map((expense, index) => {
                const meta =
                  CATEGORY_STYLES[expense.category] ?? {
                    ...defaultCat,
                    chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
                  };
                const Icon = meta.Icon;
                return (
                  <motion.article
                    key={expense.id}
                    initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                      delay: reduceMotion ? 0 : index * 0.06,
                    }}
                    whileHover={reduceMotion ? undefined : { x: 2 }}
                    className="group relative flex gap-0 overflow-hidden rounded-[1.15rem] border border-slate-200/80 bg-white/90 transition-colors hover:border-violet-200/80 dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-violet-500/25"
                  >
                    <div className={`w-1 shrink-0 ${meta.stripe}`} />
                    <div className="flex min-w-0 flex-1 items-center gap-4 p-4 sm:p-5">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.iconWrap}`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                          {expense.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.chip}`}
                          >
                            {expense.category}
                          </span>
                          <span className="text-[12px] text-slate-500 dark:text-slate-400">
                            {expense.createdAt}
                            <span className="mx-1.5 text-slate-300 dark:text-slate-600">
                              ·
                            </span>
                            Paid by {expense.paidBy}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-mono text-base font-semibold tabular-nums text-slate-900 dark:text-slate-50 sm:text-lg">
                          {expense.currency} {expense.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="balances"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {MOCK_GROUPS.map((group, index) => (
                <motion.article
                  key={group.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                    delay: reduceMotion ? 0 : index * 0.07,
                  }}
                  className="rounded-[1.15rem] border border-slate-200/80 bg-white/90 p-5 dark:border-slate-800/80 dark:bg-slate-900/90"
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {group.name}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {group.members.length} members
                    </span>
                  </div>
                  <div className="mb-4 flex -space-x-2 pl-0.5">
                    {group.members.map((person) => (
                      <span
                        key={person.id}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold dark:border-slate-900 ${avatarColor(person.name)}`}
                        title={person.name}
                      >
                        {initials(person.name)}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-4 py-3 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-900/50">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Your balance
                    </p>
                    <p className="mt-1 text-right font-mono text-xl font-semibold tabular-nums text-slate-900 dark:text-white">
                      {group.currency}{" "}
                      <CountUp value={group.balance} />
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!MOCK_EXPENSES.length && (
          <section className="mt-8 rounded-[1.25rem] border border-dashed border-slate-300/90 bg-white/80 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/50">
              <Sparkles className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              No expenses yet
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Start with your first shared payment and track balances in real time.
            </p>
            <button
              type="button"
              className="mt-5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => setIsModalOpen(true)}
            >
              Add first expense
            </button>
          </section>
        )}

        <motion.button
          type="button"
          aria-label="Add Expense"
          onClick={() => setIsModalOpen(true)}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={
            pulseFab && !reduceMotion
              ? { opacity: 1, y: 0, scale: [1, 1.04, 1] }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-24 right-5 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-semibold text-white ring-2 ring-white/90 dark:ring-slate-950 md:bottom-8 md:right-8"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Add Expense
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center dark:bg-slate-950/60"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-[1.35rem] border border-slate-200/90 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 p-2.5 text-violet-700 dark:from-violet-950/80 dark:to-indigo-950/80 dark:text-violet-300">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Quick add expense
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">
                    Mock flow for prototype
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  readOnly
                  value="Team lunch"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                />
                <input
                  readOnly
                  value="USD 86.00"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                />
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="relative z-10">Settle up</span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-300 ease-out group-hover:translate-x-full" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
