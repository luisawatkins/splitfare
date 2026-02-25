 "use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

type Props = {
  variant?: "primary" | "secondary";
  label?: string;
};

export function PrivyLoginButton(props: Props) {
  const router = useRouter();
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();

  useEffect(() => {
    if (ready && authenticated && user) {
      const handleRedirect = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            apiClient.setToken(token);
          }

          try {
            const me = await apiClient.users.me();
            
            if (me) {
              if (!me.ens_name) {
                router.push("/onboarding/ens");
              } else {
                router.push("/dashboard");
              }
            } else {
              const wallet = user.wallet?.address;
              const email = user.email?.address || `${user.id}@privy.com`;
              
              const userData = {
                email: email,
                name: user.id.slice(0, 8),
                username: user.id.slice(0, 8),
                wallet_address: wallet,
              };

              await apiClient.users.create(userData as any);
              router.push("/onboarding/ens");
            }
          } catch (e: any) {
            console.error("Profile check/creation failed:", e);
            router.push("/onboarding/ens");
          }
        } catch (error) {
          console.error("Redirect handler failed:", error);
        }
      };

      handleRedirect();
    }
  }, [ready, authenticated, user, router, getAccessToken]);

  const label = props.label ?? (authenticated ? "Manage account" : "Join with Privy");

  const baseClasses =
    "w-full max-w-xs rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition";

  const variantClasses =
    props.variant === "secondary"
      ? "border border-slate-900 bg-[#ffe7f7] text-slate-950 hover:bg-white"
      : "border-2 border-slate-900 bg-slate-950 text-slate-50 shadow-[0_8px_0_0_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_0_0_rgba(15,23,42,1)] active:translate-y-1 active:shadow-[0_4px_0_0_rgba(15,23,42,1)]";

  const handleClick = () => {
    if (!ready) return;
    if (authenticated) {
      logout();
    } else {
      login();
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

