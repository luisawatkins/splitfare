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
    <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r-2 border-slate-900 h-screen sticky top-0 p-8">
      <div className="flex items-center gap-4 mb-14">
        <div className="h-12 w-12 rounded-2xl bg-brand-pink flex items-center justify-center text-slate-950 font-black text-2xl border-2 border-slate-900 shadow-brutalist-sm">
          S
        </div>
        <span className="font-black text-2xl tracking-tighter uppercase text-slate-50">SplitFare</span>
      </div>

      <div className="flex-1 space-y-3">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.label} href={item.href}>
              <div className={cn(
                "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group border-2 border-transparent",
                isActive 
                  ? "bg-brand-pink/10 text-brand-pink border-brand-pink/20 shadow-none" 
                  : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-200 hover:border-slate-800"
              )}>
                <Icon size={22} className={cn("transition-all duration-300", isActive ? "stroke-[3]" : "stroke-[2]")} />
                <span className="text-[11px] font-black tracking-[0.15em] uppercase">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-8 border-t-2 border-slate-900 space-y-4">
        <Link href="/groups/create" className="block">
          <Button className="w-full h-14 rounded-full bg-brand-pink text-slate-950 font-black uppercase tracking-[0.2em] border-2 border-slate-900 shadow-brutalist hover:shadow-brutalist-lg active:translate-y-1 active:shadow-none transition-all duration-200">
            <Plus size={20} className="mr-2 stroke-[4]" />
            Create Group
          </Button>
        </Link>
        <button 
          onClick={logout}
          className="flex items-center gap-4 px-5 py-3.5 w-full rounded-2xl text-rose-500 hover:bg-rose-500/10 border-2 border-transparent hover:border-rose-500/20 transition-all duration-300 font-black uppercase tracking-[0.15em] text-[11px]"
        >
          <LogOut size={20} className="stroke-[3]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
