"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, History, Plus, Search, User, Receipt, Users, Settings } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Activity", icon: History, href: "/dashboard/activity" },
  { label: "Add", icon: Plus, href: "/groups/create", isFab: true },
  { label: "Search", icon: Search, href: "/dashboard/search" },
  { label: "Profile", icon: User, href: "/dashboard/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-between bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-5 h-20">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isFab) {
          return (
            <Link key={item.label} href={item.href} className="relative -top-6">
              <div className="h-14 w-14 rounded-full bg-violet-600 flex items-center justify-center text-white transition-transform duration-200 active:scale-95">
                <Plus size={24} />
              </div>
            </Link>
          );
        }

        return (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1.5 group">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-200",
              isActive ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300" : "text-slate-500 dark:text-slate-400"
            )}>
              <Icon size={22} className={cn("transition-all duration-300", isActive ? "stroke-[3]" : "stroke-[2]")} />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-all duration-200",
              isActive ? "text-violet-700 dark:text-violet-300 opacity-100" : "text-slate-500 dark:text-slate-400 opacity-80"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
