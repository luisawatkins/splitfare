'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
      } catch (e) {
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
        title: "Confirming registration",
        description: "Please sign the transaction in your wallet",
      });
      
      await register(validSubdomain, displayName.trim(), email.trim() || undefined);
      
      notify({
        title: "Registration successful!",
        description: `${validSubdomain}.splitfare.eth is now yours.`,
        variant: "success",
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      notify({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred",
        variant: "error",
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-pink text-slate-950 mb-2 rotate-3 border-2 border-slate-900 shadow-brutalist-sm">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none">
            Claim your <br />
            <span className="text-brand-yellow">identity</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-[11px]">
            Get your unique .splitfare.eth subdomain
          </p>
        </div>

        <Card className="p-8 bg-slate-900 border-2 border-slate-800 shadow-brutalist">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Display name
              </label>
              <Input
                placeholder="e.g. Alice"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-slate-950 border-2 border-slate-800 h-12 rounded-xl text-slate-100 placeholder:text-slate-600 focus:border-brand-pink transition-colors"
              />
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">How others will see you in groups</p>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Email <span className="text-slate-600 font-normal">(optional)</span>
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950 border-2 border-slate-800 h-12 rounded-xl text-slate-100 placeholder:text-slate-600 focus:border-brand-pink transition-colors"
              />
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Helps with recovery</p>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Choose a subdomain
              </label>
              <ENSInput onValidSubdomain={handleSubdomainValid} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex flex-col gap-2 p-3 rounded-2xl border-2 border-slate-800 bg-slate-950">
                <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">On-chain ownership</span>
              </div>
              <div className="flex flex-col gap-2 p-3 rounded-2xl border-2 border-slate-800 bg-slate-950">
                <Wallet className="w-5 h-5 text-brand-yellow" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">One-time registration</span>
              </div>
            </div>

            {gasEstimate && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-yellow" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-yellow">Est. gas</span>
                </div>
                <span className="text-[11px] font-black text-brand-yellow">{gasEstimate}</span>
              </div>
            )}

            <Button
              onClick={handleRegister}
              disabled={!validSubdomain || !displayName.trim() || isRegistering}
              className="w-full h-14 bg-brand-pink hover:bg-brand-pink/90 text-slate-950 font-black uppercase tracking-[0.2em] rounded-full border-2 border-slate-900 shadow-brutalist-sm transition-all active:translate-y-1 active:shadow-none"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register Domain
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </Card>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
          Subdomains are currently free to register
        </p>
      </motion.div>
    </div>
  );
}
