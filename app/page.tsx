"use client";

import { PrivyLoginButton } from "@/components/auth/PrivyLoginButton";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Globe2,
  Layers,
  Link2,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

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

  const sectionMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.3, ease: "easeOut" as const },
      };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-violet-600 text-white grid place-items-center font-bold">S</div>
            <span className="text-lg font-semibold">Splitfare</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-2 md:items-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="mb-4 inline-flex rounded-full border border-violet-200 dark:border-violet-500/40 bg-violet-100 dark:bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
              Modern expense splitting for groups
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Split anything. Settle fast.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Splitfare helps friends, roommates, and teams track shared expenses with
              clear balances and one-tap settlements. It feels as simple as Splitwise,
              but with a polished fintech experience.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
              {ready && authenticated ? (
                <>
                  <button
                    type="button"
                    onClick={goToApp}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
                  >
                    Go to app
                    <ArrowRight className="h-4 w-4" />
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
            <div className="mt-6 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
              {[
                "Smart group balances",
                "Receipt-friendly expense logging",
                "Fast settlement flows",
              ].map((line) => (
                <div key={line} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-violet-600" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...sectionMotion}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lisbon Trip</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">4 members</p>
            </div>
            <div className="space-y-3">
              {[
                ["Dinner at Time Out", "USD 142.40"],
                ["Metro cards", "USD 24.00"],
                ["Apartment utilities", "USD 48.90"],
              ].map((item, index) => (
                <motion.div
                  key={item[0]}
                  initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.08 }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-200">{item[0]}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">{item[1]}</span>
                </motion.div>
              ))}
            </div>
            <button className="group relative mt-4 w-full overflow-hidden rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">
              <span className="relative z-10">Settle balances</span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-300 group-hover:translate-x-full" />
            </button>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Group-first",
                text: "Trips, rent, events, and subscriptions in one clean workspace.",
              },
              {
                icon: Wallet,
                title: "Fast settlements",
                text: "Tap once to settle balances with clear, trusted records.",
              },
              {
                icon: ShieldCheck,
                title: "Reliable history",
                text: "Receipts and settlement history stay organized and accessible.",
              },
            ].map((item, index) => (
              <motion.article key={item.title} {...sectionMotion} transition={{ duration: 0.3, ease: "easeOut", delay: reduceMotion ? 0 : index * 0.08 }} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <motion.div {...sectionMotion} className="mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight">From receipt to settled</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Receipt,
                title: "Log expenses",
                text: "Capture what was paid, by whom, and for which category.",
              },
              {
                icon: Globe2,
                title: "Track balances",
                text: "See live group totals with clear who-owes-whom visibility.",
              },
              {
                icon: Wallet,
                title: "Settle quickly",
                text: "Use one-tap settlement actions and keep history audit-friendly.",
              },
            ].map((item, index) => (
              <motion.div key={item.title} {...sectionMotion} transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.08 }} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <item.icon className="mb-3 h-5 w-5 text-violet-600 dark:text-violet-300" />
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8">
          <motion.div
            {...sectionMotion}
            className="mx-auto max-w-6xl px-4 sm:px-6"
          >
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Built for serious groups
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
              {[
                "Privy login",
                "ENS handles",
                "Storacha proofs",
                "Avail Nexus",
                "USDC",
                "Installable PWA",
              ].map((label) => (
                <span key={label} className="whitespace-nowrap">
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <motion.div {...sectionMotion}>
              <p className="text-sm text-slate-500 dark:text-slate-400">Everyday splitting</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                Scan. Split. Done.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                Snap a receipt, tag who owes what, and let Splitfare handle the math
                and the history. No spreadsheets or messy follow-ups in group chats.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                {[
                  "One tap to log expenses with optional receipt photos",
                  "Flexible splits for trips, rent, subscriptions, and events",
                  "Balances update as people pay each other back",
                  "Category tags so reporting stays sane at tax time",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              {...sectionMotion}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-6 sm:p-8"
            >
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Popular use cases
              </h3>
              <div className="mt-4 space-y-4">
                {[
                  {
                    title: "Trips & weekends",
                    body: "Flights, Airbnb, dinners — split by night or by person without re-explaining the math.",
                  },
                  {
                    title: "Roommates & rent",
                    body: "Rent, utilities, and grocery runs in one place. See who is ahead or behind at a glance.",
                  },
                  {
                    title: "Teams & events",
                    body: "Conference meals, gear, and shared tabs. Export-friendly history when finance asks.",
                  },
                ].map((block, index) => (
                  <motion.div
                    key={block.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.25, delay: reduceMotion ? 0 : index * 0.06 }}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                  >
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{block.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{block.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-14">
          <motion.div {...sectionMotion} className="mb-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">Global cash, calm UX</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Networks your friends already use
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Hold USDC on different chains? Routing and settlement logic stay in the
              background. People see clear totals — not RPC URLs, gas sliders, or bridge
              UIs.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Base",
              "Optimism",
              "Arbitrum",
              "Polygon",
              "Ethereum Sepolia",
              "Monad",
            ].map((chain, index) => (
              <motion.div
                key={chain}
                {...sectionMotion}
                transition={{
                  duration: 0.3,
                  delay: reduceMotion ? 0 : index * 0.05,
                }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                {chain}
              </motion.div>
            ))}
          </div>
          <motion.div
            {...sectionMotion}
            className="mt-6 grid gap-4 md:grid-cols-3"
          >
            {[
              {
                title: "No manual bridging",
                text: "Balances across chains are reasoned about for you so payments feel one-step.",
              },
              {
                title: "Stable numbers",
                text: "Friends interact with USDC-style clarity, not chain-specific noise.",
              },
              {
                title: "Human identities",
                text: "ENS-style handles like alice.splitfare.eth keep names readable in groups.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                {...sectionMotion}
                transition={{
                  duration: 0.3,
                  delay: reduceMotion ? 0 : index * 0.08,
                }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
              >
                <Globe2 className="mb-2 h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div {...sectionMotion} className="mb-10 max-w-3xl">
              <p className="text-sm text-slate-500 dark:text-slate-400">Trust layer</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Proofs that outlive the chat thread
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                Splitfare treats receipts and settlements as content-addressed data.
                Storacha gives immutable CIDs, durable storage, and access patterns that
                map cleanly onto groups — so disagreements have a single place to look.
              </p>
            </motion.div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  icon: Receipt,
                  title: "Receipts that prove something",
                  body: "Attach photos to expenses; each file resolves to a CID the whole group can verify.",
                },
                {
                  icon: Layers,
                  title: "Settlement manifests",
                  body: "Structured records link payer, payee, amounts, and on-chain references in one place.",
                },
                {
                  icon: Link2,
                  title: "Cheap, batched proofs",
                  body: "Bundle history into archives and anchor roots when you need trustless summaries.",
                },
                {
                  icon: ShieldCheck,
                  title: "Data you can export",
                  body: "Take your history with you — archives that live independently of any one app.",
                },
              ].map((item, index) => (
                <motion.article
                  key={item.title}
                  {...sectionMotion}
                  transition={{
                    duration: 0.3,
                    delay: reduceMotion ? 0 : index * 0.06,
                  }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
                >
                  <item.icon className="mb-3 h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div {...sectionMotion}>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Smartphone className="h-3.5 w-3.5" />
                Progressive Web App
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Feels like a chat. Acts like a wallet.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                Install Splitfare to your home screen, log expenses offline-first when
                coverage is spotty, and sync when you are back online. Fewer tabs, fewer
                seed-phrase moments for your friends.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {[
                  "One-tap install on supported mobile browsers",
                  "Reminders when it is time to settle up",
                  "Flows designed for people who do not live in a wallet UI",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              {...sectionMotion}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Group thread · Splitfare
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25 }}
                  className="ml-auto max-w-[85%] rounded-2xl bg-violet-600 px-3 py-2.5 text-white"
                >
                  Just logged dinner — split three ways. Receipt is attached.
                </motion.div>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: reduceMotion ? 0 : 0.08 }}
                  className="max-w-[85%] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-slate-800 dark:text-slate-100"
                >
                  Balances updated. You are owed USD 44.13 from two people.
                </motion.div>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: reduceMotion ? 0 : 0.16 }}
                  className="ml-auto max-w-[85%] rounded-2xl bg-violet-600 px-3 py-2.5 text-white"
                >
                  Tap below when you are ready to settle.
                </motion.div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Secure by design — crypto stays invisible until someone explicitly acts.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <motion.div {...sectionMotion} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
            <h2 className="text-xl font-bold sm:text-2xl">Questions people ask</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {[
                {
                  q: "Is this only for crypto people?",
                  a: "No. Day-to-day flows feel like a modern money app. On-chain pieces appear only when settlement paths need them.",
                },
                {
                  q: "Can we export our history?",
                  a: "Yes. Records are export-friendly so your group can keep proof outside the app.",
                },
                {
                  q: "What about privacy?",
                  a: "Share only what belongs in the group. Handles and receipts are scoped to membership.",
                },
                {
                  q: "Can we use this for trips and rent?",
                  a: "Absolutely. Splitfare is designed for travel groups, roommates, and recurring shared costs.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.q}
                  {...sectionMotion}
                  transition={{
                    duration: 0.3,
                    delay: reduceMotion ? 0 : index * 0.06,
                  }}
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{item.q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <motion.div {...sectionMotion} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built for roommates, friends, and teams
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Splitfare keeps shared money clear, fair, and fast. No clutter, no awkward
              reminders, just transparent balances and reliable settlements.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              {ready && authenticated ? (
                <button
                  type="button"
                  onClick={goToApp}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
                >
                  Open dashboard
                </button>
              ) : (
                <PrivyLoginButton
                  variant="primary"
                  label="Get started now"
                  onLoginSuccess={goToApp}
                />
              )}
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Built for modern group finance workflows.
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Splitfare
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
