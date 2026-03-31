'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ENSInput } from '@/components/ens-input';
import { Input } from '@/components/ui/input';
import { useENS } from '@/hooks/useENS';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Wallet, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { getPrivyProfile } from '@/lib/privy-profile';
import { ThemeToggle } from '@/components/theme-toggle';

const inputFieldClass =
  'h-12 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus-visible:ring-violet-500';

export default function ENSOnboardingPage() {
  const [validSubdomain, setValidSubdomain] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const { user } = usePrivy();
  const { register, isRegistering, estimateGas } = useENS();
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const router = useRouter();
  const { notify } = useToast();

  useEffect(() => {
    if (user) {
      const { name, email: userEmail } = getPrivyProfile(user);
      setDisplayName((prev) => prev || name);
      setEmail((prev) => prev || userEmail);
    }
  }, [user]);

  const handleSubdomainValid = async (name: string) => {
    setValidSubdomain(name);
    if (name) {
      try {
        const gas = await estimateGas(name);
        setGasEstimate(gas);
      } catch {
        setGasEstimate(null);
      }
    } else {
      setGasEstimate(null);
    }
  };

  const handleRegister = async () => {
    if (!validSubdomain || !displayName.trim()) return;

    try {
      notify({
        title: 'Confirming registration',
        description: 'Please sign the transaction in your wallet',
      });

      await register(validSubdomain, displayName.trim(), email.trim() || undefined);

      notify({
        title: 'Registration successful!',
        description: `${validSubdomain}.splitfare.eth is now yours.`,
        variant: 'success',
      });

      router.push('/dashboard');
    } catch (error: unknown) {
      notify({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'error',
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm dark:bg-violet-600">
            <Sparkles className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Claim your <span className="text-violet-600 dark:text-violet-400">identity</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Get your unique <span className="font-medium text-slate-800 dark:text-slate-200">.splitfare.eth</span>{' '}
            subdomain
          </p>
        </div>

        <Card className="border-2 border-slate-200 bg-white p-8 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="onboard-display-name">
                Display name
              </label>
              <Input
                id="onboard-display-name"
                placeholder="e.g. Alice"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputFieldClass}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">How others will see you in groups</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="onboard-email">
                Email <span className="font-normal text-slate-500 dark:text-slate-500">(optional)</span>
              </label>
              <Input
                id="onboard-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputFieldClass}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Helps with recovery</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Choose a subdomain</span>
              <ENSInput onValidSubdomain={handleSubdomainValid} inputClassName={inputFieldClass} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">On-chain ownership</span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <Wallet className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">One-time registration</span>
              </div>
            </div>

            {gasEstimate ? (
              <div className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-3 py-3 dark:border-violet-500/30 dark:bg-violet-500/10">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
                  <span className="text-xs font-semibold text-violet-800 dark:text-violet-200">Est. gas</span>
                </div>
                <span className="text-xs font-semibold text-violet-900 dark:text-violet-100">{gasEstimate}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleRegister}
              disabled={!validSubdomain || !displayName.trim() || isRegistering}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Registering…
                </>
              ) : (
                <>
                  Register domain
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </>
              )}
            </button>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-500">Subdomains are currently free to register</p>
      </motion.div>
    </div>
  );
}
