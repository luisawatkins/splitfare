'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useChainBalances } from '@/hooks/useChainBalances';
import { FAUCET_URLS } from '@/lib/chains';
import { Wallet, ExternalLink, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

export function ChainBalances() {
  const { usdcBalance, isLoading, isError, bestChain } = useChainBalances();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-slate-900/50 rounded-3xl border-2 border-slate-800" />
        <div className="h-40 bg-slate-900/50 rounded-3xl border-2 border-slate-800" />
      </div>
    );
  }

  if (isError || !usdcBalance) {
    return (
      <Card className="p-6 border-2 border-rose-900 bg-rose-950/20 text-rose-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-rose-500" />
          <p className="text-xs font-black uppercase tracking-widest">Failed to load chain balances</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-slate-900 bg-brand-pink text-slate-950 shadow-brutalist relative overflow-hidden rounded-3xl">
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <Wallet size={120} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-950/60">
              Aggregated USDC Balance (Across all chains)
            </p>
            <div className="p-2 rounded-xl border-2 border-slate-900 shadow-brutalist-sm bg-white/40 text-slate-950">
              <Zap size={18} strokeWidth={3} />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
              USDC {parseFloat(usdcBalance.totalBalance).toFixed(2)}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-950/80">
                Nexus Unified Balance
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-50 text-[9px] font-black uppercase tracking-widest">
                Optimized
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Chain Breakdown</h3>
        <div className="grid gap-3">
          {usdcBalance.breakdown.map((chain, index) => {
            const isBest = bestChain?.chainId === chain.chainId;
            
            return (
              <motion.div
                key={chain.chainId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "p-4 flex items-center justify-between border-2 border-slate-800 bg-slate-950/50 transition-all duration-300 rounded-3xl",
                  isBest && "border-brand-yellow/50 bg-brand-yellow/5"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border-2 border-slate-900 shadow-brutalist-sm overflow-hidden",
                      isBest ? "bg-brand-yellow text-slate-950" : "bg-slate-900 text-slate-400"
                    )}>
                      {chain.logo ? (
                        <img src={chain.logo} alt={chain.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-black text-xl uppercase leading-none">{chain.name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black tracking-tight text-base uppercase leading-none text-slate-100">
                          {chain.name}
                        </h4>
                        {isBest && (
                          <span className="text-[8px] font-black bg-brand-yellow text-slate-950 px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-slate-900">
                            Best Source
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        {chain.contractAddress.slice(0, 6)}...{chain.contractAddress.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-lg font-black tracking-tight uppercase leading-none text-slate-100">
                      {parseFloat(chain.balance).toFixed(2)} <span className="text-[10px] text-slate-500">USDC</span>
                    </p>
                    {FAUCET_URLS[chain.chainId] && (
                      <a 
                        href={FAUCET_URLS[chain.chainId]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-brand-pink hover:text-brand-pink/80 transition-colors"
                      >
                        Get Faucet <ExternalLink size={10} className="ml-1" />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-[10px] text-slate-500 leading-relaxed italic">
        * Nexus SDK automatically optimizes transfers by choosing the best source chain based on your balances and current gas prices.
      </div>
    </div>
  );
}
