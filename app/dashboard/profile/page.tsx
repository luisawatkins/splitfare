"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  User,
  Mail,
  AtSign,
  Wallet,
  Calendar,
  ExternalLink,
  Settings,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type MeUser = {
  id?: string;
  email?: string;
  name?: string;
  username?: string;
  ens_name?: string | null;
  wallet_address?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

function truncateMiddle(s: string, head = 6, tail = 4) {
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function safeJoined(iso?: string) {
  if (!iso) return null;
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return null;
  }
}

function ProfileRow({
  icon,
  label,
  value,
  mono,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-brutalist-sm">
      <div className="h-11 w-11 shrink-0 rounded-2xl bg-brand-pink/10 border-2 border-brand-pink/20 flex items-center justify-center text-brand-pink">
        {icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-bold text-slate-50 break-all",
            mono && "font-mono text-xs tracking-tight"
          )}
        >
          {value}
        </p>
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}

export default function ProfilePage() {
  const { getAccessToken } = usePrivy();
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (token) apiClient.setToken(token);
      return apiClient.users.me() as Promise<MeUser | null>;
    },
  });

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
    <div className="container max-w-2xl py-10 space-y-8 min-h-screen bg-slate-950">
      <header className="px-2 space-y-1">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
          Account
        </p>
        <h1 className="text-3xl font-black tracking-tight uppercase text-slate-50">
          Profile
        </h1>
      </header>

      {isLoading ? (
        <div className="px-2 space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-24 w-24 rounded-full bg-slate-900 border-2 border-slate-800 animate-pulse" />
            <div className="h-6 w-40 bg-slate-900 rounded-lg animate-pulse border border-slate-800" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-full bg-slate-900 animate-pulse rounded-3xl border-2 border-slate-800"
            />
          ))}
        </div>
      ) : !user ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-2 flex flex-col items-center justify-center py-20 gap-5 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-center px-6"
        >
          <User className="h-12 w-12 stroke-[3] text-brand-pink" />
          <div className="space-y-1">
            <p className="text-slate-50 font-black uppercase tracking-wide text-lg">
              No profile yet
            </p>
            <p className="text-slate-500 text-sm font-medium">
              Finish onboarding so your SplitFare account is linked.
            </p>
          </div>
          <Link href="/onboarding/ens">
            <Button className="rounded-full bg-brand-pink text-slate-950 font-black uppercase tracking-[0.15em] text-[11px] border-2 border-slate-900 shadow-brutalist-sm">
              Continue setup
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8 px-2 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-3 pt-2"
          >
            <Avatar
              src={user.avatar_url || undefined}
              fallback={(user.name || user.username || "SF").slice(0, 2).toUpperCase()}
              className="h-28 w-28 border-2 border-slate-900 shadow-brutalist-sm bg-brand-pink text-slate-950 font-black text-3xl"
            />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-50">
                {user.name}
              </h2>
              {user.username ? (
                <p className="text-slate-500 text-sm font-medium mt-1">@{user.username}</p>
              ) : null}
            </div>
          </motion.div>

          <div className="space-y-3">
            {user.email ? (
              <ProfileRow
                icon={<Mail size={18} className="stroke-[2.5]" />}
                label="Email"
                value={user.email}
              />
            ) : null}

            {user.username ? (
              <ProfileRow
                icon={<AtSign size={18} className="stroke-[2.5]" />}
                label="Username"
                value={user.username}
              />
            ) : null}

            {user.ens_name ? (
              <div className="space-y-2">
                <ProfileRow
                  icon={<User size={18} className="stroke-[2.5]" />}
                  label="ENS"
                  value={user.ens_name}
                />
                <a
                  href={`https://app.ens.domains/${user.ens_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-brand-pink hover:text-brand-pink/80 py-2"
                >
                  View on ENS
                  <ExternalLink size={14} className="stroke-[2.5]" />
                </a>
              </div>
            ) : null}

            {user.wallet_address ? (
              <ProfileRow
                icon={<Wallet size={18} className="stroke-[2.5]" />}
                label="Wallet"
                value={truncateMiddle(user.wallet_address)}
                mono
                action={
                  <button
                    type="button"
                    onClick={() => copyWallet(user.wallet_address!)}
                    className="p-2.5 rounded-xl border-2 border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600 hover:text-slate-50 transition-colors"
                    aria-label="Copy wallet address"
                  >
                    {copied ? (
                      <Check size={18} className="text-emerald-400 stroke-[2.5]" />
                    ) : (
                      <Copy size={18} className="stroke-[2.5]" />
                    )}
                  </button>
                }
              />
            ) : null}

            {safeJoined(user.created_at) ? (
              <ProfileRow
                icon={<Calendar size={18} className="stroke-[2.5]" />}
                label="Member since"
                value={safeJoined(user.created_at)!}
              />
            ) : null}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              variant="outline"
              className="rounded-2xl border-2 border-slate-700 bg-slate-900 text-slate-50 font-black uppercase tracking-[0.15em] text-[11px] h-12 hover:bg-slate-800 hover:border-slate-600"
            >
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings size={18} className="stroke-[2.5]" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
