"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Plus,
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
} from "lucide-react";
import { CATEGORIES } from "@/lib/validations/expense";
import { Badge } from "@/components/ui/badge";

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

type ExpenseRow = {
  id: string;
  groupId: string;
  groupName: string;
  currency: string;
  description: string;
  category: string;
  total_amount: number;
  created_at: string;
  paidByName: string | null;
};

async function fetchExpensesAcrossGroups(
  token: string,
  groups: { id: string; name: string; currency?: string | null }[]
): Promise<ExpenseRow[]> {
  const rows: ExpenseRow[] = [];

  await Promise.all(
    groups.map(async (g) => {
      if (!g.id) return;
      try {
        const res = await fetch(
          `/api/groups/${g.id}/expenses?limit=100&sortBy=date&sortOrder=desc`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (!res.ok || !json.success || !json.data?.items) return;

        for (const e of json.data.items as Array<{
          id: string;
          description: string | null;
          category: string | null;
          total_amount: number | string;
          created_at: string;
          paidBy?: { name?: string } | null;
        }>) {
          rows.push({
            id: e.id,
            groupId: g.id,
            groupName: g.name,
            currency: g.currency ?? "USDC",
            description: e.description?.trim() || "Expense",
            category: e.category || "general",
            total_amount: Number(e.total_amount),
            created_at: e.created_at,
            paidByName: e.paidBy?.name ?? null,
          });
        }
      } catch {
        /* skip group */
      }
    })
  );

  return rows.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function addExpenseHref(groups: { id: string }[] | undefined) {
  if (!groups?.length) return "/groups/create";
  if (groups.length === 1) return `/groups/${groups[0].id}/expenses/create`;
  return "/groups";
}

function safeFormatDate(iso: string) {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return "";
  }
}

export default function ExpensesPage() {
  const { getAccessToken } = usePrivy();

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

  const isLoading =
    groupsLoading || (groupsWithId.length > 0 && expensesLoading);
  const rows = expenseRows ?? [];
  const plusHref = addExpenseHref(groupsWithId);

  return (
    <div className="container max-w-2xl py-10 space-y-8 min-h-screen bg-slate-950">
      <header className="px-2 flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
            Overview
          </p>
          <h1 className="text-3xl font-black tracking-tight uppercase text-slate-50">
            Your Expenses
          </h1>
        </div>
        <Link href={plusHref} aria-label="Add expense">
          <div className="h-12 w-12 shrink-0 rounded-full bg-brand-pink flex items-center justify-center text-slate-950 border-2 border-slate-900 shadow-brutalist-sm hover:shadow-brutalist active:translate-y-0.5 transition-all duration-200">
            <Plus size={24} className="stroke-[3]" />
          </div>
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[4.5rem] w-full bg-slate-900 animate-pulse rounded-3xl border-2 border-slate-800"
            />
          ))}
        </div>
      ) : groupsWithId.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-6 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem]"
        >
          <Receipt className="h-14 w-14 stroke-[3] text-brand-pink" />
          <div className="text-center space-y-1 px-6">
            <p className="text-slate-50 font-black uppercase tracking-wide text-lg">
              No groups yet
            </p>
            <p className="text-slate-500 text-sm font-medium">
              Create a group first, then log expenses from the group or here.
            </p>
          </div>
          <Link
            href="/groups/create"
            className="px-6 py-3 rounded-full bg-brand-pink text-slate-950 text-[11px] font-black uppercase tracking-[0.2em] border-2 border-slate-900 shadow-brutalist-sm"
          >
            Create group
          </Link>
        </motion.div>
      ) : rows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-6 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem]"
        >
          <Receipt className="h-14 w-14 stroke-[3] text-brand-pink" />
          <div className="text-center space-y-1 px-6">
            <p className="text-slate-50 font-black uppercase tracking-wide text-lg">
              No expenses yet
            </p>
            <p className="text-slate-500 text-sm font-medium">
              Tap + to add one, or open a group and use the expense flow there.
            </p>
          </div>
          <Link
            href={plusHref}
            className="px-6 py-3 rounded-full bg-brand-pink text-slate-950 text-[11px] font-black uppercase tracking-[0.2em] border-2 border-slate-900 shadow-brutalist-sm"
          >
            Add expense
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => {
            const Icon = categoryIcons[row.category] || Tag;
            const categoryMeta = CATEGORIES.find((c) => c.id === row.category);
            const tagLabel = (categoryMeta?.id ?? row.category).toUpperCase();

            return (
              <motion.div
                key={`${row.groupId}-${row.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link href={`/groups/${row.groupId}/expenses/${row.id}`}>
                  <div className="flex items-center gap-4 p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl hover:border-slate-700 hover:bg-slate-900/80 active:translate-y-0.5 transition-all duration-200 shadow-brutalist-sm group">
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
                          {row.paidByName ? ` · Paid by ${row.paidByName}` : ""}
                          {" · "}
                          {row.groupName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm font-black text-brand-pink tabular-nums">
                        {row.total_amount.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          {row.currency}
                        </span>
                      </p>
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors stroke-[2.5]" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
