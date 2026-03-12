import { 
  baseSepolia, 
  optimismSepolia, 
  arbitrumSepolia, 
  polygonAmoy, 
  sepolia 
} from 'viem/chains';
import { type Chain } from 'viem';

export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
} as const satisfies Chain;

export const SUPPORTED_CHAINS = [
  sepolia,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
  polygonAmoy,
  monadTestnet,
];

export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [sepolia.id]: '0x1c7D4B196Cb0232471b45180109211c121547b59',
  [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  [optimismSepolia.id]: '0x5fd037Fe0C66411F04067d4F175f7342902263b1',
  [arbitrumSepolia.id]: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  [polygonAmoy.id]: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
  [monadTestnet.id]: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', 
};

export const FAUCET_URLS: Record<number, string> = {
  [sepolia.id]: 'https://sepolia-faucet.pk910.de/',
  [baseSepolia.id]: 'https://www.coinbase.com/faucets/base-ethereum-faucet',
  [optimismSepolia.id]: 'https://www.coinbase.com/faucets/optimism-ethereum-faucet',
  [arbitrumSepolia.id]: 'https://www.coinbase.com/faucets/arbitrum-ethereum-faucet',
  [polygonAmoy.id]: 'https://faucet.polygon.technology/',
  [monadTestnet.id]: 'https://faucet.monad.xyz/',
};
