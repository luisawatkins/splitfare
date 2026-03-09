"use client";

import { Button } from "@/components/ui/button";
import { Plus, Receipt, Users, Wallet } from "lucide-react";
import Link from "next/link";

type QuickActionsProps = {
  groupId: string;
};

export function QuickActions({ groupId }: QuickActionsProps) {
  const actions = [
    {
      label: "Add Expense",
      icon: <Plus className="h-5 w-5" />,
      href: `/groups/${groupId}/expenses/create`,
      className: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    {
      label: "Settle Up",
      icon: <Wallet className="h-5 w-5" />,
      href: `/groups/${groupId}/settle`,
      className: "bg-emerald-500 text-white hover:bg-emerald-600",
    },
    {
      label: "View Balances",
      icon: <Users className="h-5 w-5" />,
      href: `/groups/${groupId}?tab=balances`,
      className: "bg-blue-500 text-white hover:bg-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => (
        <Link key={action.label} href={action.href} className="block">
          <Button
            variant="ghost"
            className={`w-full flex flex-col items-center gap-2 h-auto py-4 rounded-2xl transition-all duration-300 shadow-sm border border-border/50 hover:shadow-md hover:scale-[1.02] ${action.className}`}
          >
            <div className="bg-white/20 p-2 rounded-xl">
              {action.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {action.label}
            </span>
          </Button>
        </Link>
      ))}
    </div>
  );
}
