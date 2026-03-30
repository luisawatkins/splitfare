"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, History, Plus, Search, User, Receipt, Users, Settings, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { BellIcon } from "@/components/notifications/bell-icon";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const router = useRouter();
  const { logout } = usePrivy();

  async function handleSignOut() {
    try {
      await logout();
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-[17rem] border-r border-slate-200/90 bg-slate-50/70 dark:border-slate-800/90 dark:bg-slate-950/80 h-screen sticky top-0 p-5">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-base font-bold text-white">
            S
          </div>
          <span className="font-semibold text-[1.05rem] tracking-tight text-slate-900 dark:text-slate-50">
            Splitfare
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <ThemeToggle />
          <BellIcon />
        </div>
      </div>

      <div className="flex-1 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.label} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/80 hover:text-slate-900 dark:hover:bg-slate-900/80 dark:hover:text-slate-100"
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "shrink-0",
                    isActive ? "opacity-100" : "opacity-80"
                  )}
                />
                <span className="text-[13px] font-semibold">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-2 border-t border-slate-200/80 pt-5 dark:border-slate-800/80">
        <Link href="/groups/create" className="block">
          <Button className="h-11 w-full rounded-full border-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-[13px] font-semibold text-white hover:from-violet-500 hover:to-indigo-500">
            <Plus size={17} className="mr-2" />
            Create group
          </Button>
        </Link>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
