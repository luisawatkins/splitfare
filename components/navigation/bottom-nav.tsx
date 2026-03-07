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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-between bg-background/80 backdrop-blur-xl border-t border-border/50 px-6 h-20 pb-4 shadow-2xl">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isFab) {
          return (
            <Link key={item.label} href={item.href} className="relative -top-6">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 active:scale-90 transition-transform duration-200">
                <Plus size={28} className="stroke-[3]" />
              </div>
            </Link>
          );
        }

        return (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1 group">
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-300 active:scale-90",
              isActive ? "bg-primary/10 text-primary shadow-inner" : "text-muted-foreground hover:text-foreground"
            )}>
              <Icon size={24} className={cn("transition-all duration-300", isActive && "stroke-[2.5]")} />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest transition-all duration-300",
              isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-60"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
