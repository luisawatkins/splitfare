"use client";

import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { CATEGORIES } from "@/lib/validations/expense";
import { 
  Tag, Utensils, Car, Home, Music, 
  ShoppingBag, Zap, Plane, Paperclip,
  ArrowUpRight, ArrowDownLeft 
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ExpenseWithDetails } from "@/hooks/useExpenses";

const categoryIcons: Record<string, any> = {
  general: Tag,
  food: Utensils,
  transport: Car,
  housing: Home,
  entertainment: Music,
  shopping: ShoppingBag,
  utilities: Zap,
  travel: Plane,
};

interface ExpenseCardProps {
  expense: ExpenseWithDetails;
  currentUserId: string;
}

export function ExpenseCard({ expense, currentUserId }: ExpenseCardProps) {
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
    <Card className="p-4 border-border/50 hover:bg-muted/30 transition-all group active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
          "bg-muted group-hover:bg-primary/10"
        )}>
          <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm truncate">{expense.description}</h4>
            {hasReceipt && <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {isPayer ? "You" : expense.paidBy.name} paid {formatCurrency(Number(expense.total_amount))}
          </p>
        </div>

        <div className="text-right shrink-0">
          {impactType !== "none" ? (
            <>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                impactType === "owed" ? "text-emerald-500" : "text-rose-500"
              )}>
                {impactLabel}
              </p>
              <p className={cn(
                "text-sm font-black",
                impactType === "owed" ? "text-emerald-500" : "text-rose-500"
              )}>
                {formatCurrency(impactAmount)}
              </p>
            </>
          ) : (
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Not involved
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
