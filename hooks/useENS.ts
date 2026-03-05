'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { checkAvailability, validateSubdomain } from '@/lib/ens';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { apiClient } from '@/lib/api-client';

export function useENS() {
  const { wallets } = useWallets();
  const { getAccessToken } = usePrivy();
  const [subdomain, setSubdomain] = useState('');
  const [debouncedSubdomain, setDebouncedSubdomain] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSubdomain(subdomain);
    }, 300);
    return () => clearTimeout(timer);
  }, [subdomain]);

  const validation = validateSubdomain(debouncedSubdomain);

  const { data: isAvailable, isLoading: isChecking, error: checkError } = useQuery({
    queryKey: ['ens-availability', debouncedSubdomain],
    queryFn: () => checkAvailability(debouncedSubdomain),
    enabled: debouncedSubdomain.length >= 3 && validation.valid,
  });

  const registerMutation = useMutation({
    mutationFn: async (params: { subdomain: string; name: string; email?: string }) => {
      const wallet = wallets[0];
      if (!wallet) throw new Error('No wallet connected');

      const token = await getAccessToken();
      if (token) apiClient.setToken(token);

      await apiClient.ens.register(params.subdomain, wallet.address, {
        name: params.name,
        email: params.email,
      });
      return true;
    },
  });

  const estimateGas = async (name: string) => {
    return 'Free (Off-chain)';
  };

  return {
    subdomain,
    setSubdomain,
    debouncedSubdomain,
    isAvailable,
    isChecking,
    checkError,
    validation,
    register: (subdomain: string, name: string, email?: string) =>
      registerMutation.mutateAsync({ subdomain, name, email }),
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    estimateGas,
  };
}

export function useReverseResolve(address?: string) {
  return useQuery({
    queryKey: ['ens-reverse', address],
    queryFn: async () => {
      if (!address) return null;
      try {
        const { reverseResolve } = await import('@/lib/ens');
        return await reverseResolve(address);
      } catch (e) {
        return null;
      }
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
