'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { toDbUserId } from '@/lib/privy-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/currency';
import { useChainBalances, useTransfer } from '@/hooks/useChainBalances';
import { 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Zap,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SettleViewProps {
  groupId: string;
}

export function SettleView({ groupId }: SettleViewProps) {
  const { user: privyUser, getAccessToken } = usePrivy();
  const currentUserId = privyUser ? toDbUserId(privyUser.id) : "";
  const { usdcBalance, isLoading: balancesLoading, bestChain } = useChainBalances();
  const { transfer, isTransferring } = useTransfer();
  
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [transferStatus, setTransferStatus] = useState<any>(null);

  const { data: balanceData, isLoading: debtsLoading } = useQuery({
    queryKey: ["group-balances", groupId],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`/api/groups/${groupId}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      return result.data;
    },
    enabled: !!groupId && !!privyUser,
  });

  const myDebts = balanceData?.simplifiedDebts.filter((d: any) => d.from.id === currentUserId) || [];

  const handleSettle = async (debt: any) => {
    if (!bestChain) return;
    
    setSelectedDebt(debt);
    try {
      const result = await transfer({
        token: 'USDC',
        amount: debt.amount.toString(),
        toChainId: 84532, // Base Sepolia as default destination for now
        recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Mock recipient address
        onProgress: (event) => {
          setTransferStatus(event);
        }
      });
      console.log('Transfer complete:', result);
    } catch (e) {
      console.error('Transfer failed:', e);
    }
  };

  if (debtsLoading || balancesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Calculating your debts...</p>
      </div>
    );
  }

  if (myDebts.length === 0) {
    return (
      <Card className="w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/90 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70 sm:p-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <div className="flex h-20 w-20 rotate-3 items-center justify-center rounded-3xl border-2 border-emerald-500/25 bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500">
              Zero Debt!
            </h3>
            <p className="text-balance px-2 text-xs font-bold uppercase leading-relaxed tracking-wide text-slate-600 dark:text-slate-400 sm:text-sm sm:tracking-widest">
              You don&apos;t owe anyone in this group. You&apos;re all settled up!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Settle your debts</h3>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Select a debt to pay using USDC</p>
      </div>

      <div className="grid gap-4">
        {myDebts.map((debt: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-5 border-2 border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all rounded-3xl shadow-none hover:shadow-brutalist-sm group">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <Avatar src={debt.to.avatarUrl} fallback={debt.to.name.slice(0, 2).toUpperCase()} className="h-12 w-12 border-2 border-slate-900 shadow-brutalist-sm" />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-brand-pink border-2 border-slate-950 flex items-center justify-center">
                      <ArrowRight size={10} className="text-slate-950 stroke-[4]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pay to</p>
                    <p className="text-base font-black uppercase tracking-tight text-slate-100">{debt.to.name}</p>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <p className="text-2xl font-black tracking-tighter text-brand-pink leading-none">
                    {formatCurrency(debt.amount)}
                  </p>
                  <Button 
                    onClick={() => handleSettle(debt)}
                    disabled={isTransferring}
                    size="sm"
                    className="h-9 px-4 rounded-xl bg-brand-yellow text-slate-950 border-2 border-slate-900 shadow-brutalist-sm hover:shadow-none active:translate-y-0.5 transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    {isTransferring && selectedDebt?.to.id === debt.to.id ? (
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                    ) : (
                      <Wallet size={14} className="mr-1.5" />
                    )}
                    Settle Now
                  </Button>
                </div>
              </div>

              {bestChain && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-brand-yellow flex items-center justify-center text-slate-950 border border-slate-950">
                      <Zap size={10} strokeWidth={4} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Optimized Source: <span className="text-slate-300">{bestChain.name}</span>
                    </span>
                  </div>
                  <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                    Balance: {parseFloat(bestChain.balance).toFixed(2)} USDC
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isTransferring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6"
          >
            <Card className="w-full max-w-sm p-8 border-2 border-slate-800 bg-slate-900 shadow-brutalist rounded-[2.5rem] space-y-8 text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-pink/10 mb-2">
                <Loader2 className="w-12 h-12 text-brand-pink animate-spin stroke-[3]" />
                <div className="absolute -top-2 -right-2 p-2 rounded-2xl bg-brand-yellow border-2 border-slate-900 shadow-brutalist-sm rotate-12">
                  <Zap size={20} className="text-slate-950" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-100 leading-tight">
                  Nexus Cross-Chain <br /> Settlement
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Optimizing route across {usdcBalance?.breakdown.length} chains
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Amount</span>
                    <span className="text-xs font-black text-brand-pink">{formatCurrency(selectedDebt?.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Source</span>
                    <span className="text-xs font-black text-slate-300">{bestChain?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Destination</span>
                    <span className="text-xs font-black text-slate-300">Base Sepolia</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-2">
                  <ShieldCheck size={14} className="text-brand-yellow" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Secured by Avail Nexus</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-bold italic text-slate-600">Please confirm the transaction in your wallet</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
