"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BellIcon } from "@/components/notifications/bell-icon";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-violet-500/30 selection:text-inherit font-sans">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col bg-slate-50 dark:bg-slate-950 md:max-w-[calc(100vw-17rem)]">
        <header className="flex items-center justify-between border-b border-slate-200/90 bg-slate-50/90 p-4 dark:border-slate-800/90 dark:bg-slate-950/90 md:hidden supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
              S
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-violet-800 bg-clip-text text-lg font-semibold tracking-tight text-transparent dark:from-white dark:to-violet-200">
              Splitfare
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <BellIcon />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-50 dark:bg-slate-950 pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
