"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Copy,
  Mail,
  ExternalLink,
  Settings,
  Check,
  User,
  Wallet,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type MeUser = {
  email: string;
  name: string;
  username: string;
  ens_name: string;
  wallet_address: string;
  avatar_url: string | null;
};

function truncateMiddle(s: string, head = 6, tail = 4) {
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

const MOCK_USER: MeUser = {
  email: "alex@splitfare.app",
  name: "Alex Kim",
  username: "alexk",
  ens_name: "alex.splitfare.eth",
  wallet_address: "0x95A1C75E8B2D4A7E1f57d14af8398C2B7f22B2D4",
  avatar_url: null,
};

function ProfileRow({
  icon,
  label,
  value,
  mono,
  action,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/50 dark:text-violet-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p
          className={`${mono ? "font-mono text-xs tracking-tight" : "text-sm"} font-semibold break-all text-slate-900 dark:text-slate-100`}
        >
          {value}
        </p>
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}

export default function ProfilePage() {
  const reduceMotion = useReducedMotion();
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);
  const user = MOCK_USER;

  const copyWallet = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      notify({ title: "Copied", description: "Wallet address copied.", variant: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      <header className="mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">Account</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Profile
        </h1>
      </header>

        <div className="space-y-8 pb-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-3 pt-2"
          >
            <Avatar
              src={user.avatar_url || undefined}
              fallback={(user.name || user.username || "SF").slice(0, 2).toUpperCase()}
              className="h-24 w-24 border border-violet-200 bg-violet-100 text-2xl font-bold text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/50 dark:text-violet-300"
            />
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {user.name}
              </h2>
              {user.username ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  @{user.username}
                </p>
              ) : null}
            </div>
          </motion.div>

          <div className="space-y-3">
            <ProfileRow
              icon={<Mail size={18} />}
              label="Email"
              value={user.email}
            />

            <ProfileRow
              icon={<User size={18} />}
              label="ENS"
              value={user.ens_name}
              action={
                <a
                  href={`https://app.ens.domains/${user.ens_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  <ExternalLink size={18} />
                </a>
              }
            />

            <ProfileRow
              icon={<Wallet size={18} />}
              label="Wallet"
              value={truncateMiddle(user.wallet_address)}
              mono
              action={
                <button
                  type="button"
                  onClick={() => copyWallet(user.wallet_address)}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                  aria-label="Copy wallet address"
                >
                  {copied ? (
                    <Check size={18} className="text-emerald-600" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              }
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings size={16} />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
