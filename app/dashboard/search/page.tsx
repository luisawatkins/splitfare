"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Search,
  Users,
  Receipt,
  Tag,
  Utensils,
  Car,
  Home,
  Music,
  ShoppingBag,
  Zap,
  Plane,
  ArrowRight,
  SearchX,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/validations/expense";
import { fetchExpensesAcrossGroups } from "@/lib/cross-group-expenses";

const categoryIcons: Record<string, typeof Tag> = {
  general: Tag,
  food: Utensils,
  transport: Car,
  housing: Home,
  entertainment: Music,
  shopping: ShoppingBag,
  utilities: Zap,
  travel: Plane,
};

function safeFormatDate(iso: string) {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return "";
  }
}

function matchesQuery(haystack: string | null | undefined, q: string) {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(q);
}

export default function SearchPage() {
  const { getAccessToken } = usePrivy();
  const [rawQuery, setRawQuery] = useState("");
  const q = rawQuery.trim().toLowerCase();

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (token) apiClient.setToken(token);
      return apiClient.groups.list();
    },
  });

  const groupsWithId = (groups ?? []).filter(
    (g): g is typeof g & { id: string } => typeof g.id === "string" && g.id.length > 0
  );

  const { data: expenseRows, isLoading: expensesLoading } = useQuery({
    queryKey: ["dashboard-expenses", groupsWithId.map((g) => g.id)],
    enabled: groupsWithId.length > 0,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return [];
      return fetchExpensesAcrossGroups(token, groupsWithId);
    },
  });

  const expenses = expenseRows ?? [];

  const matchedGroups = useMemo(() => {
    if (!q) return [];
    return groupsWithId.filter(
      (g) =>
        matchesQuery(g.name, q) ||
        matchesQuery(g.description, q) ||
        matchesQuery(g.category, q) ||
        matchesQuery(g.invite_code, q)
    );
  }, [groupsWithId, q]);

  const matchedExpenses = useMemo(() => {
    if (!q) return [];
    return expenses.filter(
      (e) =>
        matchesQuery(e.description, q) ||
        matchesQuery(e.groupName, q) ||
        matchesQuery(e.paidByName, q) ||
        matchesQuery(e.category, q)
    );
  }, [expenses, q]);

  const isLoading =
    groupsLoading || (groupsWithId.length > 0 && expensesLoading);
  const hasQuery = q.length > 0;
  const noMatches =
    hasQuery && matchedGroups.length === 0 && matchedExpenses.length === 0;

  return (
    <div className="container max-w-2xl py-10 space-y-8 min-h-screen bg-slate-950">
      <header className="px-2 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
            Find
          </p>
          <h1 className="text-3xl font-black tracking-tight uppercase text-slate-50">
            Search
          </h1>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            size={20}
            strokeWidth={2.5}
          />
          <Input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Groups, expenses, invite code…"
            className={cn(
              "h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-800 bg-slate-900 text-slate-50",
              "placeholder:text-slate-600 font-medium text-sm",
              "focus-visible:ring-2 focus-visible:ring-brand-pink/40 focus-visible:border-brand-pink/30"
            )}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4 px-2">
          <div className="h-4 w-24 bg-slate-800 animate-pulse rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-full bg-slate-900 animate-pulse rounded-3xl border-2 border-slate-800"
            />
          ))}
        </div>
      ) : groupsWithId.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-2 flex flex-col items-center justify-center py-20 gap-5 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem]"
        >
          <Users className="h-12 w-12 stroke-[3] text-brand-pink" />
          <p className="text-slate-500 text-sm font-medium text-center px-8">
            Join or create a group to search expenses and group details here.
          </p>
          <Link
            href="/groups/create"
            className="px-6 py-3 rounded-full bg-brand-pink text-slate-950 text-[11px] font-black uppercase tracking-[0.2em] border-2 border-slate-900 shadow-brutalist-sm"
          >
            Create group
          </Link>
        </motion.div>
      ) : !hasQuery ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-2 flex flex-col items-center justify-center py-16 gap-4 text-center px-6"
        >
          <div className="h-16 w-16 rounded-2xl border-2 border-slate-800 bg-slate-900 flex items-center justify-center text-brand-pink">
            <Search size={28} className="stroke-[3]" />
          </div>
          <p className="text-slate-400 text-sm font-medium max-w-sm">
            Search by group name, description, category, invite code, expense
            title, or who paid.
          </p>
        </motion.div>
      ) : noMatches ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-2 flex flex-col items-center justify-center py-20 gap-4 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem]"
        >
          <SearchX className="h-12 w-12 stroke-[3] text-slate-600" />
          <p className="text-slate-50 font-black uppercase tracking-wide text-sm">
            No matches
          </p>
          <p className="text-slate-500 text-sm font-medium px-8 text-center">
            Try another keyword or check spelling.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-10 px-2 pb-8">
          {matchedGroups.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-500 px-1">
                Groups
              </h2>
              <div className="space-y-2">
                {matchedGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link href={`/groups/${group.id}`}>
                      <div className="flex items-center gap-4 p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl hover:border-slate-700 hover:bg-slate-900/80 active:translate-y-0.5 transition-all shadow-brutalist-sm group">
                        <div className="h-12 w-12 rounded-2xl bg-brand-pink/10 border-2 border-brand-pink/20 flex items-center justify-center text-brand-pink font-black text-lg shrink-0">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-50 font-black text-sm truncate uppercase tracking-wide">
                            {group.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 h-4 uppercase font-black tracking-wider bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {group.category}
                            </Badge>
                            {group.description ? (
                              <span className="text-slate-500 text-[11px] font-medium truncate max-w-[200px]">
                                {group.description}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 shrink-0 stroke-[2.5]" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {matchedExpenses.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-500 px-1">
                Expenses
              </h2>
              <div className="space-y-2">
                {matchedExpenses.map((row, index) => {
                  const Icon = categoryIcons[row.category] || Tag;
                  const categoryMeta = CATEGORIES.find(
                    (c) => c.id === row.category
                  );
                  const tagLabel = (categoryMeta?.id ?? row.category).toUpperCase();

                  return (
                    <motion.div
                      key={`${row.groupId}-${row.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={`/groups/${row.groupId}/expenses/${row.id}`}
                      >
                        <div className="flex items-center gap-4 p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl hover:border-slate-700 hover:bg-slate-900/80 active:translate-y-0.5 transition-all shadow-brutalist-sm group">
                          <div className="h-12 w-12 rounded-2xl flex items-center justify-center border-2 shrink-0 bg-brand-pink/10 border-brand-pink/20 text-brand-pink">
                            <Icon size={20} className="stroke-[3]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-50 font-black text-sm truncate uppercase tracking-wide">
                              {row.description}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-4 uppercase font-black tracking-wider bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {tagLabel}
                              </Badge>
                              <span className="text-slate-500 text-[11px] font-medium truncate">
                                {safeFormatDate(row.created_at)}
                                {row.paidByName
                                  ? ` · ${row.paidByName}`
                                  : ""}
                                {" · "}
                                {row.groupName}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs font-black text-brand-pink tabular-nums shrink-0">
                            {row.total_amount.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{" "}
                            <span className="text-slate-500 text-[9px] uppercase">
                              {row.currency}
                            </span>
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
