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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-between bg-slate-950/80 backdrop-blur-xl border-t-2 border-slate-900 px-6 h-24 pb-6">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isFab) {
          return (
            <Link key={item.label} href={item.href} className="relative -top-8">
              <div className="h-16 w-16 rounded-full bg-brand-pink flex items-center justify-center text-slate-950 shadow-brutalist border-2 border-slate-900 active:translate-y-1 active:shadow-none transition-all duration-200">
                <Plus size={32} className="stroke-[4]" />
              </div>
            </Link>
          );
        }

        return (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1.5 group">
            <div className={cn(
              "p-2.5 rounded-2xl transition-all duration-300 active:scale-90 border-2 border-transparent",
              isActive ? "bg-brand-pink/10 text-brand-pink border-brand-pink/20" : "text-slate-500 hover:text-slate-300"
            )}>
              <Icon size={22} className={cn("transition-all duration-300", isActive ? "stroke-[3]" : "stroke-[2]")} />
            </div>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300",
              isActive ? "text-brand-pink opacity-100" : "text-slate-600 opacity-80"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
