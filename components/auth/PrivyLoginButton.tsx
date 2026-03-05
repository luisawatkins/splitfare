"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

type Props = {
  variant?: "primary" | "secondary";
  label?: string;
  onLoginSuccess?: () => void;
};

export function PrivyLoginButton(props: Props) {
  const router = useRouter();
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();

  const redirectToApp = async () => {
    if (!authenticated || !user) return;
    try {
      const token = await getAccessToken();
      if (token) apiClient.setToken(token);
      const me = await apiClient.users.me();
      if (me) {
        router.push(me.ens_name ? "/dashboard" : "/onboarding/ens");
      } else {
        const wallet = user.wallet?.address;
        const email = user.email?.address || `${user.id}@privy.com`;
        await apiClient.users.create({
          email,
          name: user.id.slice(0, 8),
          username: `u_${user.id.replace(/[^a-zA-Z0-9]/g, "").slice(-12)}`,
          wallet_address: wallet,
        } as any);
        router.push("/onboarding/ens");
      }
    } catch {
      router.push("/onboarding/ens");
    }
  };

  useEffect(() => {
    if (ready && authenticated && user) {
      getAccessToken().then((token) => token && apiClient.setToken(token));
    }
  }, [ready, authenticated, user, getAccessToken]);

  const label = props.label ?? (authenticated ? "Manage account" : "Join with Privy");

  const baseClasses =
    "w-full max-w-xs rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition";

  const variantClasses =
    props.variant === "secondary"
      ? "border border-slate-900 bg-[#ffe7f7] text-slate-950 hover:bg-white"
      : "border-2 border-slate-900 bg-slate-950 text-slate-50 shadow-[0_8px_0_0_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_0_0_rgba(15,23,42,1)] active:translate-y-1 active:shadow-[0_4px_0_0_rgba(15,23,42,1)]";

  const handleClick = async () => {
    if (!ready) return;
    if (authenticated) {
      logout();
    } else {
      await login();
      setTimeout(() => {
        if (props.onLoginSuccess) props.onLoginSuccess();
        else redirectToApp();
      }, 100);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready}
      className={`${baseClasses} ${variantClasses} ${!ready ? "opacity-60" : ""}`}
    >
      {label}
    </button>
  );
}

