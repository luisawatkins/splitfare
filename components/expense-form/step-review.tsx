"use client";

import { useFormContext } from "react-hook-form";
import { type ExpenseFormValues, CATEGORIES } from "@/lib/validations/expense";
import { formatCurrency } from "@/lib/currency";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tag, 
  Utensils, 
  Car, 
  Home, 
  Music, 
  ShoppingBag, 
  Zap, 
  Plane, 
  Calendar, 
  CreditCard, 
  Users,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import { ReceiptViewer } from "@/components/receipt-viewer";

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

interface StepReviewProps {
  members: Array<{ id: string; name: string }>;
}

export function StepReview({ members }: StepReviewProps) {
  const { watch } = useFormContext<ExpenseFormValues>();
  const values = watch();

  const category = CATEGORIES.find(c => c.id === values.category);
  const CategoryIcon = category ? categoryIcons[category.id] : Tag;
  const paidBy = members.find(m => m.id === values.paidById);
  const involvedMembers = values.members.filter(m => m.involved);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CategoryIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{formatCurrency(values.amount)}</h2>
          <p className="text-muted-foreground font-medium">{values.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{format(values.date, "PPP")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="outline" className="gap-1">
                <CategoryIcon className="h-3 w-3" />
                {category?.name || "General"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid by</span>
              <span className="font-medium">{paidBy?.name || "Unknown"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Split ({values.splitType.toLowerCase()})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {involvedMembers.map((m) => {
              const member = members.find(gm => gm.id === m.userId);
              let shareAmount = 0;
              
              if (values.splitType === "EQUAL") {
                shareAmount = values.amount / involvedMembers.length;
              } else if (values.splitType === "EXACT") {
                shareAmount = m.amount || 0;
              } else if (values.splitType === "PERCENTAGE") {
                shareAmount = (values.amount * (m.percentage || 0)) / 100;
              } else if (values.splitType === "SHARES") {
                const totalShares = involvedMembers.reduce((acc, curr) => acc + (curr.shares || 0), 0);
                shareAmount = (values.amount * (m.shares || 0)) / totalShares;
              }

              return (
                <div key={m.userId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{member?.name}</span>
                  <span className="font-medium">{formatCurrency(shareAmount)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {values.receiptCid && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Receipt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReceiptViewer cid={values.receiptCid} />
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
        <p className="text-sm text-center text-muted-foreground italic">
          Confirming will create this expense and update balances for everyone involved.
        </p>
      </div>
    </div>
  );
}
