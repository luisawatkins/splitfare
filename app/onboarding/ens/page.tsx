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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400 text-slate-950 mb-4 rotate-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Claim your identity
          </h1>
          <p className="text-slate-400">
            Get your unique .splitfare.eth subdomain to make payments easier.
          </p>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Display name
              </label>
              <Input
                placeholder="e.g. Alice"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
              <p className="text-xs text-slate-500">How others will see you in groups</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Email <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
              <p className="text-xs text-slate-500">For wallet-only users — helps with recovery</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Choose a subdomain
              </label>
              <ENSInput onValidSubdomain={handleSubdomainValid} />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>On-chain ownership</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Wallet className="w-4 h-4 text-yellow-400" />
                <span>One-time registration</span>
              </div>
              {gasEstimate && (
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Est. gas: {gasEstimate}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleRegister}
              disabled={!validSubdomain || !displayName.trim() || isRegistering}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-wider transition-all"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register Domain
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Subdomains are currently free to register. You only pay for gas.
        </p>
      </motion.div>
    </div>
  );
}
