"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { CATEGORIES } from "@/lib/validations/expense";
import {
  Tag,
  Utensils,
  Car,
  Home,
  Music,
  ShoppingBag,
  Zap,
  Plane,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ExpenseWithDetails } from "@/hooks/useExpenses";
import Link from "next/link";
import { useParams } from "next/navigation";

const categoryIcons: Record<string, typeof Tag> = {
  other: Tag,
  food: Utensils,
  transport: Car,
  accommodation: Home,
  travel: Plane,
  subscription: Zap,
};

interface ExpenseCardProps {
  expense: ExpenseWithDetails;
  currentUserId: string;
}

export function ExpenseCard({ expense, currentUserId }: ExpenseCardProps) {
  const { id: groupId } = useParams();
  const category = CATEGORIES.find(c => c.id === expense.category);
  const Icon = categoryIcons[expense.category] || Tag;
  
  const isPayer = expense.paidBy.id === currentUserId;
  const userSplit = expense.splits.find(s => s.user_id === currentUserId);
  const hasReceipt = expense.receipts && expense.receipts.length > 0;


  let impactAmount = 0;
  let impactLabel = "";
  let impactType: "owe" | "owed" | "none" = "none";

  if (isPayer) {
    impactAmount = Number(expense.total_amount) - (userSplit ? Number(userSplit.amount_owed) : 0);
    impactLabel = "you lent";
    impactType = "owed";
  } else if (userSplit) {
    impactAmount = Number(userSplit.amount_owed);
    impactLabel = "you owe";
    impactType = "owe";
  }

  return (
    <Link
      href={`/groups/${groupId}/expenses/${expense.id}`}
      className="block w-full min-w-0 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950"
    >
      <Card className="group w-full border-2 border-slate-200 bg-white p-4 text-slate-900 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50/90 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
              "bg-slate-100 text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-violet-950/60 dark:group-hover:text-violet-300",
            )}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-50">
                {expense.description}
              </h4>
              {hasReceipt ? (
                <Paperclip className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" />
              ) : null}
            </div>
            <p className="truncate text-xs text-slate-600 dark:text-slate-400">
              {isPayer ? "You" : expense.paidBy.name} paid{" "}
              {formatCurrency(Number(expense.total_amount))}
            </p>
          </div>

          <div className="shrink-0 text-right">
            {impactType !== "none" ? (
              <>
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    impactType === "owed"
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-rose-600 dark:text-rose-500",
                  )}
                >
                  {impactLabel}
                </p>
                <p
                  className={cn(
                    "text-sm font-black tabular-nums",
                    impactType === "owed"
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-rose-600 dark:text-rose-500",
                  )}
                >
                  {formatCurrency(impactAmount)}
                </p>
              </>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Not involved
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
