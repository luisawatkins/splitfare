"use client";

import { PrivyLoginButton } from "@/components/auth/PrivyLoginButton";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function HomePage() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const router = useRouter();

  const goToApp = async () => {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-900 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            SplitFare
          </div>
          <div className="hidden gap-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400 sm:flex">
            <span>On-chain settlements</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>Storacha powered</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>PWA</span>
          </div>
          <button className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-100 transition hover:border-slate-100 hover:bg-slate-800">
            Get early access
          </button>
        </div>
      </header>

      <main className="flex flex-col">
        <section className="relative flex min-h-[80vh] w-full items-center justify-center bg-[#ff6ad5] py-20 text-center text-slate-950">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-4 top-10 h-16 w-32 rounded-full border-2 border-slate-900 bg-[#ffe7f7]" />
            <div className="absolute bottom-10 right-6 h-20 w-40 rounded-full border-2 border-slate-900 bg-[#ffe7f7]" />
            <div className="absolute left-1/2 top-4 h-10 w-24 -translate-x-1/2 rounded-full border-2 border-slate-900 bg-[#ffe7f7]" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-4">
            <div className="rounded-full border border-slate-900 bg-[#ffe7f7] px-5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]">
              Splitwise meets on-chain settlements
            </div>
            <h1 className="text-balance text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Split anything.
              <br />
              Settle everywhere.
            </h1>
            <p className="max-w-xl text-balance text-sm font-medium leading-relaxed text-slate-900/80 sm:text-base">
              SplitFare is a Web3-native expense-splitting app where receipts live
              on Storacha, settlements move across chains via Avail Nexus, and
              every expense is provable forever.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              {ready && authenticated ? (
                <>
                  <button
                    type="button"
                    onClick={goToApp}
                    className="w-full max-w-xs rounded-full border-2 border-slate-900 bg-slate-950 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-50 shadow-[0_8px_0_0_rgba(15,23,42,1)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_0_0_rgba(15,23,42,1)]"
                  >
                    Go to App
                  </button>
                  <PrivyLoginButton variant="secondary" label="Manage account" />
                </>
              ) : (
                <>
                  <PrivyLoginButton
                    variant="primary"
                    label="Join with social login"
                    onLoginSuccess={goToApp}
                  />
                  <PrivyLoginButton
                    variant="secondary"
                    label="Continue with wallet"
                    onLoginSuccess={goToApp}
                  />
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900/80">
              <span>Privy social login</span>
              <span className="h-3 w-px bg-slate-900/40" />
              <span>ENS handles like alice.splitfare.eth</span>
              <span className="h-3 w-px bg-slate-900/40" />
              <span>Installable PWA</span>
            </div>
          </div>
        </section>

        <section className="border-y border-yellow-400 bg-yellow-300 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-950">
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-6 overflow-x-auto px-4">
            <div className="flex shrink-0 items-center gap-6">
              <span>Cross-chain USDC</span>
              <span>Avail Nexus routing</span>
              <span>Storacha CIDs</span>
              <span>Receipts as proof</span>
              <span>No manual bridging</span>
              <span>Groups & trips</span>
              <span>On-chain manifests</span>
              <span>Permanent archives</span>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-16 text-slate-950 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 md:flex-row md:items-center">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
                Scan. Split. Done.
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Snap a receipt, tag who owes what, and let SplitFare handle the
                math, the records, and the on-chain settlements. No spreadsheets,
                no awkward reminders, no “who paid for what?” months later.
              </p>
              <ul className="space-y-2 text-sm text-slate-800 sm:text-base">
                <li>One tap to log expenses with attached receipt photos.</li>
                <li>
                  Flexible splits for trips, rent, subscriptions, and everything
                  in between.
                </li>
                <li>
                  Clear group balances that update instantly as people pay each
                  other back.
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="mx-auto max-w-sm rounded-3xl border-2 border-slate-900 bg-[#ff6ad5] p-5 shadow-[0_18px_0_0_rgba(15,23,42,1)]">
                <div className="mb-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-900">
                  <span>NYC Trip</span>
                  <span>3 friends</span>
                </div>
                <div className="space-y-2 rounded-2xl bg-[#ffe7f7] p-3 text-xs text-slate-900">
                  <div className="flex items-center justify-between">
                    <span>Dinner in SoHo</span>
                    <span className="font-semibold">$132.40</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Paid by you</span>
                    <span className="text-[10px] uppercase tracking-[0.18em]">
                      Receipt on Storacha
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 rounded-2xl bg-slate-950 p-3 text-xs text-slate-50">
                  <div className="flex items-center justify-between">
                    <span>Alice owes you</span>
                    <span className="font-semibold">$44.13</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bob owes you</span>
                    <span className="font-semibold">$44.13</span>
                  </div>
                  <button className="mt-3 w-full rounded-full bg-[#ff6ad5] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-950">
                    Settle in USDC
                  </button>
                </div>
                <p className="mt-4 text-[10px] leading-relaxed text-slate-900/80">
                  Settlements route across Base, Optimism, Arbitrum, Polygon,
                  Ethereum Sepolia, or Monad via Avail Nexus. No bridging, ever.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-yellow-400 bg-yellow-300 px-4 py-16 text-slate-950 sm:py-20">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
                Global cash. Local feel.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-800 sm:text-base">
                Friends can keep using whatever network they already hold USDC
                on. SplitFare and Avail Nexus handle the cross-chain routing in
                the background, so settling up feels instant and chainless.
              </p>
            </div>
            <div className="grid gap-6 text-xs font-semibold uppercase tracking-[0.18em] sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-900 bg-yellow-200 px-4 py-5">
                <div className="mb-2 text-[11px] text-slate-700">Networks</div>
                <div className="space-y-1 text-slate-950">
                  <p>Base</p>
                  <p>Optimism</p>
                  <p>Arbitrum</p>
                  <p>Polygon</p>
                  <p>Ethereum Sepolia</p>
                  <p>Monad</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-900 bg-yellow-200 px-4 py-5">
                <div className="mb-2 text-[11px] text-slate-700">No manual bridging</div>
                <p className="text-[11px] leading-relaxed text-slate-900">
                  Nexus aggregates balances across chains and picks the optimal
                  route for every payment.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-900 bg-yellow-200 px-4 py-5">
                <div className="mb-2 text-[11px] text-slate-700">Stable UX</div>
                <p className="text-[11px] leading-relaxed text-slate-900">
                  Friends just see USDC totals, not RPC URLs, gas settings, or
                  bridge UIs.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-900 bg-yellow-200 px-4 py-5">
                <div className="mb-2 text-[11px] text-slate-700">Group handles</div>
                <p className="text-[11px] leading-relaxed text-slate-900">
                  Everyone gets an ENS subdomain like alice.splitfare.eth for
                  clean, human-readable identities.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#e4ddff] px-4 py-16 text-slate-950 sm:py-20">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
                Storacha as the trust layer.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-800 sm:text-base">
                SplitFare treats every receipt and settlement as content-addressed
                data. Storacha gives us immutable CIDs, Filecoin-backed
                permanence, and UCAN-powered access that maps cleanly onto
                groups.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-slate-900 bg-[#f5f2ff] p-5 text-sm text-slate-900">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Receipts that actually prove something
                </h3>
                <p>
                  Attach a photo to any expense and SplitFare pushes it to
                  Storacha. The CID sits alongside the expense so anyone in the
                  group can resolve and verify the original file.
                </p>
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-900 bg-[#f5f2ff] p-5 text-sm text-slate-900">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Settlement manifests
                </h3>
                <p>
                  Every USDC settlement generates a structured manifest with
                  payer, payee, amounts, tx hash, and linked expense/receipt
                  CIDs. That manifest is stored on Storacha as the canonical
                  truth.
                </p>
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-900 bg-[#f5f2ff] p-5 text-sm text-slate-900">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Cheap, massive proofs
                </h3>
                <p>
                  Group histories are periodically bundled into CAR archives and
                  anchored on-chain with a single root CID, giving you a
                  trustless proof of hundreds of records in one transaction.
                </p>
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-900 bg-[#f5f2ff] p-5 text-sm text-slate-900">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Data you actually own
                </h3>
                <p>
                  Export your complete group history as a Storacha-hosted
                  archive that lives independently of SplitFare, plus shared
                  media spaces for trips and documents.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-yellow-400 bg-[#6fd3ff] px-4 py-16 text-slate-950 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 md:flex-row md:items-center">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
                Feels like a chat, acts like a wallet.
              </h2>
              <p className="text-sm leading-relaxed text-slate-800 sm:text-base">
                SplitFare is built as a Progressive Web App, so it installs to
                your home screen, works offline-first for logging expenses, and
                syncs seamlessly once you are back online.
              </p>
              <ul className="space-y-2 text-sm text-slate-900 sm:text-base">
                <li>One-tap PWA install on iOS and Android.</li>
                <li>Push-style reminders when it is time to settle up.</li>
                <li>No browser tabs or seed phrases in your friends’ faces.</li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="mx-auto max-w-sm rounded-3xl border-2 border-slate-900 bg-slate-950 p-5 text-slate-50 shadow-[0_18px_0_0_rgba(15,23,42,1)]">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Group chat · SplitFare
                </div>
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="ml-auto max-w-[80%] rounded-2xl bg-[#ff6ad5] px-3 py-2 text-slate-950">
                    Just logged tonight&apos;s dinner. Split three ways.
                  </div>
                  <div className="max-w-[80%] rounded-2xl bg-slate-800 px-3 py-2">
                    Receipt uploaded to Storacha. Alice and Bob now owe you
                    $44.13 each.
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-2xl bg-[#ff6ad5] px-3 py-2 text-slate-950">
                    Tap here to settle in USDC from any supported chain.
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Secure by design</span>
                  <span>Crypto invisible</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-slate-950 px-4 py-10 text-slate-200">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                Be the first to split on-chain without feeling on-chain.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                We are onboarding the first groups now. Bring your friends, your
                trips, and your messy shared expenses. Leave with permanent,
                verifiable records that you actually own.
              </p>
            </div>
            <button className="rounded-full border border-slate-600 bg-slate-100 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white">
              Join the early access list
            </button>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Built on Storacha · Avail Nexus · USDC
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
