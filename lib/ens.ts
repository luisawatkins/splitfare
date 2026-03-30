import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';
import { createOffchainClient, ChainName } from '@thenamespace/offchain-manager';

const chain = process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ? mainnet : sepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export const DOMAIN = process.env.NEXT_PUBLIC_ENS_DOMAIN || 'splitfare.eth';

export const namespaceClient = createOffchainClient({
  mode: chain.id === 1 ? 'mainnet' : 'sepolia',
});

if (process.env.NAMESPACE_API_KEY) {
  namespaceClient.setApiKey(DOMAIN, process.env.NAMESPACE_API_KEY);
} else {
  console.warn("NAMESPACE_API_KEY is not defined in environment variables");
}

export async function checkAvailability(subdomain: string) {
  if (!subdomain || subdomain.length < 3 || subdomain.length > 20) {
    return false;
  }
  
  // Only alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(subdomain)) {
    return false;
  }

  try {
    const response = await namespaceClient.isSubnameAvailable(`${subdomain.toLowerCase()}.${DOMAIN}`);
    return response.isAvailable;
  } catch (error) {
    const fullName = `${subdomain.toLowerCase()}.${DOMAIN}`;
    try {
      const address = await publicClient.getEnsAddress({
        name: normalize(fullName),
      });
      return address === null;
    } catch (e) {
      return true;
    }
  }
}

export async function registerSubdomain(subdomain: string, address: string) {
  try {
    await namespaceClient.createSubname({
      parentName: DOMAIN,
      label: subdomain.toLowerCase(),
      addresses: [
        {
          chain: ChainName.Ethereum,
          value: address,
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Namespace registration error:', error);
    throw error;
  }
}

export async function resolveName(name: string) {
  try {
    return await publicClient.getEnsAddress({
      name: normalize(name),
    });
  } catch (error) {
    return null;
  }
}

export async function reverseResolve(address: string) {
  try {
    return await publicClient.getEnsName({
      address: address as `0x${string}`,
    });
  } catch (error) {
    return null;
  }
}

export function validateSubdomain(subdomain: string): { valid: boolean; error?: string } {
  if (subdomain.length < 3) return { valid: false, error: 'Too short (min 3 chars)' };
  if (subdomain.length > 20) return { valid: false, error: 'Too long (max 20 chars)' };
  if (!/^[a-zA-Z0-9]+$/.test(subdomain)) return { valid: false, error: 'Alphanumeric only' };
  return { valid: true };
}

export function formatAddress(address: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function displayUserIdentity(user: { ens_name?: string | null; wallet_address?: string | null; name?: string }) {
  if (user.ens_name) return user.ens_name;
  if (user.wallet_address) return formatAddress(user.wallet_address);
  return user.name || 'Unknown';
}

export async function getDisplayName(address: string, fallbackUser?: { ens_name?: string | null; name?: string }) {
  if (fallbackUser?.ens_name) return fallbackUser.ens_name;
  
  try {
    const ensName = await reverseResolve(address);
    if (ensName) return ensName;
  } catch (e) {
  }
  
  if (fallbackUser?.name) return fallbackUser.name;
  
  return formatAddress(address);
}
