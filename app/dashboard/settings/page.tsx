"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  User,
  Bell,
  LogOut,
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/cn";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

function SettingsRow({
  icon,
  title,
  description,
  onClick,
  href,
  disabled,
  trailing,
  destructive,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  trailing?: ReactNode;
  destructive?: boolean;
}) {
  const inner = (
    <>
      <div
        className={cn(
          "h-11 w-11 shrink-0 rounded-xl border flex items-center justify-center",
          destructive
            ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300"
            : "bg-violet-100 border-violet-200 text-violet-700 dark:bg-violet-500/15 dark:border-violet-500/30 dark:text-violet-300"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left pt-0.5">
        <p
          className={cn(
            "text-sm font-semibold",
            destructive ? "text-rose-600 dark:text-rose-300" : "text-slate-900 dark:text-slate-100"
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ?? (
        <ChevronRight
          className={cn(
            "h-5 w-5 shrink-0 stroke-[2.5]",
            destructive ? "text-rose-400/60" : "text-slate-400 dark:text-slate-500"
          )}
        />
      )}
    </>
  );

  const className = cn(
    "flex items-center gap-4 w-full p-4 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl transition-all",
    disabled
      ? "opacity-50 pointer-events-none"
      : "hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800 active:translate-y-0.5"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {inner}
    </button>
  );
}

export default function SettingsPage() {
  const reduceMotion = useReducedMotion();
  const { theme, setTheme } = useTheme();
  const { ready, authenticated, login, logout } = usePrivy();
  const { notify } = useToast();
  const { unreadCount, markAllAsRead } = useNotifications();
  const [marking, setMarking] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onMarkAllRead = async () => {
    setMarking(true);
    try {
      await markAllAsRead();
      notify({
        title: "Notifications",
        description: "All notifications marked as read.",
        variant: "success",
      });
    } catch {
      notify({
        title: "Something went wrong",
        description: "Could not update notifications.",
        variant: "error",
      });
    } finally {
      setMarking(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
          <div className="h-10 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      <header className="mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">App</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
      </header>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {!authenticated ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign in to sync notifications and sign out on this device.
            </p>
            <Button className="mt-3" size="sm" onClick={() => login()}>
              Sign in
            </Button>
          </div>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-1">
            Theme
          </h2>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 flex">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition",
                mounted && theme === "light"
                  ? "bg-violet-600 text-white"
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition",
                mounted && theme === "dark"
                  ? "bg-violet-600 text-white"
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              Dark
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-1">
            Account
          </h2>
          <div className="space-y-2">
            <SettingsRow
              icon={<User size={18} className="stroke-[2.5]" />}
              title="Profile"
              description="Name, wallet, ENS, and member info"
              href="/dashboard/profile"
            />
            <SettingsRow
              icon={<Home size={18} className="stroke-[2.5]" />}
              title="Dashboard"
              description="Balances and your groups"
              href="/dashboard"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-1">
            Notifications
          </h2>
          <div className="space-y-2">
            <SettingsRow
              icon={<Bell size={18} className="stroke-[2.5]" />}
              title="Mark all as read"
              description={
                !authenticated
                  ? "Sign in to manage notifications"
                  : unreadCount > 0
                    ? `${unreadCount} unread in your inbox`
                    : "No unread notifications"
              }
              onClick={onMarkAllRead}
              disabled={
                !authenticated || marking || unreadCount === 0
              }
              trailing={
                marking ? (
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600 shrink-0 stroke-[2.5]" />
                ) : undefined
              }
            />
          </div>
        </section>

        {authenticated ? (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-1">
              Session
            </h2>
            <SettingsRow
              icon={<LogOut size={18} className="stroke-[2.5]" />}
              title="Sign out"
              description="Sign out of SplitFare on this device"
              onClick={() => logout()}
                  destructive
              trailing={<ChevronRight className="h-5 w-5 shrink-0 text-rose-500/40 stroke-[2.5]" />}
            />
          </section>
        ) : null}

        <p className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-4">
          SplitFare ·{" "}
          <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-violet-600 transition-colors">
            Marketing site
          </Link>
        </p>
      </motion.div>
      </div>
    </div>
  );
}
