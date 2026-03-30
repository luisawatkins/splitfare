'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { nexusService, UnifiedBalance, ChainBalance } from '@/lib/nexus';
import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export function useChainBalances() {
  const { wallets } = useWallets();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      const wallet = wallets[0];
      if (wallet) {
        try {
          const provider = await wallet.getEthereumProvider();
          await nexusService.initialize(provider);
          setIsInitialized(true);
        } catch (e) {
          console.error('Failed to initialize Nexus SDK:', e);
        }
      }
    }
    init();
  }, [wallets]);

  const balancesQuery = useQuery({
    queryKey: ['nexus-balances', wallets[0]?.address],
    queryFn: () => nexusService.getBalances(),
    enabled: isInitialized && !!wallets[0]?.address,
    refetchInterval: 10000, 
  });

  const usdcBalance = balancesQuery.data?.find((b) => b.symbol === 'USDC');

  const bestChain = usdcBalance?.breakdown?.length
    ? usdcBalance.breakdown.reduce((prev, current) =>
        parseFloat(current.balance) > parseFloat(prev.balance) ? current : prev
      )
    : undefined;

  return {
    balances: balancesQuery.data,
    usdcBalance,
    isLoading: balancesQuery.isLoading || !isInitialized,
    isError: balancesQuery.isError,
    bestChain,
    refetch: balancesQuery.refetch,
  };
}

export function useTransfer() {
  const transferMutation = useMutation({
    mutationFn: async ({
      token,
      amount,
      toChainId,
      recipient,
      onProgress,
    }: {
      token: string;
      amount: string;
      toChainId: number;
      recipient: string;
      onProgress?: (event: any) => void;
    }) => {
      return nexusService.executeTransfer(token, amount, toChainId, recipient, onProgress);
    },
  });

  return {
    transfer: (params: Parameters<typeof transferMutation.mutateAsync>[0]) =>
      transferMutation.mutateAsync(params),
    isTransferring: transferMutation.isPending,
    error: transferMutation.error,
  };
}
