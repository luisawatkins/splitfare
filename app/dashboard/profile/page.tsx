"use client";

import { type ReactNode, useMemo, useState } from "react";
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
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { resolvePrivyAccessToken, SIGN_IN_REQUIRED } from "@/lib/privy-token";
import type { User as ApiUser } from "@/lib/validations";

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
  const { ready, authenticated, login, user: privyUser, getAccessToken } =
    usePrivy();

  const {
    data: apiUser,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      const token = await resolvePrivyAccessToken(getAccessToken);
      if (!token) throw new Error(SIGN_IN_REQUIRED);

      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json?.error?.message || "Failed to load profile");
      }
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to load profile");
      }
      return json.data as ApiUser | null;
    },
    enabled: ready && authenticated,
    retry: false,
  });

  const user = useMemo((): MeUser | null => {
    if (!privyUser) return null;
    const wallet =
      (privyUser as { wallet?: { address?: string } }).wallet?.address ?? "";
    const email =
      (privyUser as { email?: { address?: string } }).email?.address ??
      `${privyUser.id}@privy.com`;
    const fallbackName =
      (apiUser?.name && apiUser.name.length >= 2
        ? apiUser.name
        : null) ||
      email.split("@")[0] ||
      "Member";
    const fallbackUsername =
      apiUser?.username && apiUser.username.length >= 3
        ? apiUser.username
        : `u_${privyUser.id.replace(/[^a-zA-Z0-9]/g, "").slice(-12)}`;

    if (apiUser == null) {
      return {
        email,
        name: fallbackName,
        username: fallbackUsername,
        ens_name: "",
        wallet_address: wallet,
        avatar_url: null,
      };
    }

    return {
      email: apiUser.email || email,
      name: apiUser.name || fallbackName,
      username: apiUser.username || fallbackUsername,
      ens_name: apiUser.ens_name?.trim() ?? "",
      wallet_address: apiUser.wallet_address?.trim() || wallet,
      avatar_url: apiUser.avatar_url ?? null,
    };
  }, [apiUser, privyUser]);

  const copyWallet = async (addr: string) => {
    if (!addr) {
      notify({
        title: "No wallet",
        description: "Connect a wallet to copy an address.",
        variant: "error",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      notify({
        title: "Copied",
        description: "Wallet address copied.",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "error",
      });
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

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 text-center sm:px-6 sm:pt-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Sign in to view your profile
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your account details appear here after you sign in.
          </p>
          <Button className="mt-5" onClick={() => login()}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl space-y-3 px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
          <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (isError) {
    const needsSignIn =
      error instanceof Error && error.message === SIGN_IN_REQUIRED;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 text-center sm:px-6 sm:pt-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Could not load profile
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {needsSignIn
              ? "Your session expired. Sign in again to continue."
              : "Please retry to load your profile."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            {needsSignIn && <Button onClick={() => login()}>Sign in</Button>}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const ensLink = user.ens_name
    ? `https://app.ens.domains/${user.ens_name}`
    : null;

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
            className="flex flex-col items-center gap-3 pt-2 text-center"
          >
            <Avatar
              src={user.avatar_url || undefined}
              fallback={(user.name || user.username || "SF")
                .slice(0, 2)
                .toUpperCase()}
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
            <ProfileRow icon={<Mail size={18} />} label="Email" value={user.email} />

            <ProfileRow
              icon={<User size={18} />}
              label="ENS"
              value={user.ens_name || "Not set"}
              action={
                ensLink ? (
                  <a
                    href={ensLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    <ExternalLink size={18} />
                  </a>
                ) : null
              }
            />

            <ProfileRow
              icon={<Wallet size={18} />}
              label="Wallet"
              value={
                user.wallet_address
                  ? truncateMiddle(user.wallet_address)
                  : "Not connected"
              }
              mono
              action={
                <button
                  type="button"
                  onClick={() => copyWallet(user.wallet_address)}
                  disabled={!user.wallet_address}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
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

          {apiUser === null ? (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Showing sign-in details. Complete onboarding to sync your SplitFare
              profile.
            </p>
          ) : null}

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
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
