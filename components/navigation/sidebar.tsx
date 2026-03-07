"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, History, Plus, Search, User, Receipt, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Recent Activity", icon: History, href: "/dashboard/activity" },
  { label: "My Groups", icon: Users, href: "/groups" },
  { label: "Expenses", icon: Receipt, href: "/dashboard/expenses" },
  { label: "Search", icon: Search, href: "/dashboard/search" },
  { label: "Profile", icon: User, href: "/dashboard/profile" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = usePrivy();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border/50 h-screen sticky top-0 p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-12">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
          S
        </div>
        <span className="font-black text-xl tracking-tighter uppercase">SplitFare</span>
      </div>

      <div className="flex-1 space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.label} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                isActive ? "bg-primary/10 text-primary font-black shadow-inner" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}>
                <Icon size={20} className={cn("transition-all duration-300", isActive && "stroke-[2.5]")} />
                <span className="text-sm font-black tracking-tight uppercase tracking-tighter">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-border/50">
        <Link href="/groups/create" className="block mb-4">
          <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-tighter shadow-lg shadow-primary/20 active:scale-95 transition-transform duration-200">
            <Plus size={20} className="mr-2 stroke-[3]" />
            Create Group
          </Button>
        </Link>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all duration-300 font-black uppercase tracking-tighter text-sm"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
