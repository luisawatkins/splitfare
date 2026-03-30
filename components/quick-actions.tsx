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
    <div className="grid grid-cols-3 gap-4 md:gap-5">
      {actions.map((action) => (
        <Link key={action.label} href={action.href} className="block min-w-0">
          <Button
            variant="ghost"
            className={`flex h-auto w-full min-w-0 flex-col items-center gap-2 rounded-2xl border border-border/50 py-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${action.className}`}
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
