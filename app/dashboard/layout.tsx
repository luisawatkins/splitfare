"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BellIcon } from "@/components/notifications/bell-icon";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col md:max-w-[calc(100vw-256px)] min-h-screen">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-slate-950 text-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-pink flex items-center justify-center text-slate-950 font-black text-lg border-2 border-slate-900 shadow-brutalist-sm">
              S
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">SplitFare</span>
          </div>
          <BellIcon />
        </header>
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
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
