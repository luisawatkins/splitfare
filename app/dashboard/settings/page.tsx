"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
          "h-11 w-11 shrink-0 rounded-2xl border-2 flex items-center justify-center",
          destructive
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
            : "bg-brand-pink/10 border-brand-pink/20 text-brand-pink"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left pt-0.5">
        <p
          className={cn(
            "text-sm font-black uppercase tracking-wide",
            destructive ? "text-rose-400" : "text-slate-50"
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ?? (
        <ChevronRight
          className={cn(
            "h-5 w-5 shrink-0 stroke-[2.5]",
            destructive ? "text-rose-500/50" : "text-slate-600"
          )}
        />
      )}
    </>
  );

  const className = cn(
    "flex items-center gap-4 w-full p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-brutalist-sm transition-all",
    disabled
      ? "opacity-50 pointer-events-none"
      : "hover:border-slate-700 hover:bg-slate-900/80 active:translate-y-0.5"
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
  const { logout } = usePrivy();
  const { notify } = useToast();
  const { unreadCount, markAllAsRead } = useNotifications();
  const [marking, setMarking] = useState(false);

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

  return (
    <div className="container max-w-2xl py-10 space-y-10 min-h-screen bg-slate-950 pb-24">
      <header className="px-2 space-y-1">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
          App
        </p>
        <h1 className="text-3xl font-black tracking-tight uppercase text-slate-50">
          Settings
        </h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 px-2"
      >
        <section className="space-y-3">
          <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-500 px-1">
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
          <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-500 px-1">
            Notifications
          </h2>
          <div className="space-y-2">
            <SettingsRow
              icon={<Bell size={18} className="stroke-[2.5]" />}
              title="Mark all as read"
              description={
                unreadCount > 0
                  ? `${unreadCount} unread in your inbox`
                  : "No unread notifications"
              }
              onClick={onMarkAllRead}
              disabled={marking || unreadCount === 0}
              trailing={
                marking ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-pink shrink-0 stroke-[2.5]" />
                ) : undefined
              }
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-500 px-1">
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

        <p className="text-center text-[10px] font-medium text-slate-600 pt-4">
          SplitFare ·{" "}
          <Link href="/" className="text-slate-500 hover:text-brand-pink transition-colors">
            Marketing site
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
