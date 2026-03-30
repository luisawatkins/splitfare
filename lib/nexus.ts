import { NexusSDK, NEXUS_EVENTS } from '@avail-project/nexus-core';
import { SUPPORTED_CHAINS, USDC_ADDRESSES } from './chains';

export interface ChainBalance {
  chainId: number;
  name: string;
  symbol: string;
  balance: string;
  contractAddress: string;
  logo?: string;
}

export interface UnifiedBalance {
  symbol: string;
  totalBalance: string;
  breakdown: ChainBalance[];
}

export class NexusService {
  private sdk: NexusSDK;
  private isInitialized: boolean = false;

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.sdk = new NexusSDK({ network });
  }

  async initialize(provider: any) {
    if (!this.isInitialized) {
      await this.sdk.initialize(provider);
      this.isInitialized = true;
    }
  }

  async getBalances(): Promise<UnifiedBalance[]> {
    const assets = await this.sdk.getBalancesForBridge();
    return assets.map((asset: any) => ({
      symbol: asset.symbol,
      totalBalance: asset.balance,
      breakdown: asset.breakdown.map((b: any) => ({
        chainId: b.chain.id,
        name: b.chain.name,
        symbol: b.symbol,
        balance: b.balance,
        contractAddress: b.contractAddress,
        logo: b.chain.logo,
      })),
    }));
  }

  async getUSDCBalance(): Promise<UnifiedBalance | undefined> {
    const balances = await this.getBalances();
    return balances.find((b) => b.symbol === 'USDC');
  }

  async findOptimalRoute(token: string, amount: string, toChainId: number) {
    const usdc = await this.getUSDCBalance();
    if (!usdc) return null;

    const bestSource = usdc.breakdown.reduce((prev, current) => {
      return (parseFloat(current.balance) > parseFloat(prev.balance)) ? current : prev;
    });

    return {
      sourceChainId: bestSource.chainId,
      sourceBalance: bestSource.balance,
      destChainId: toChainId,
      isDirect: bestSource.chainId === toChainId,
      gasEstimate: "0.001", // Mock gas estimate
    };
  }

  async executeTransfer(
    token: string,
    amount: string, 
    toChainId: number,
    recipient: string,
    onProgress?: (event: any) => void
  ) {
    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e6)); // USDC has 6 decimals

    return (this.sdk as any).transfer(
      {
        token,
        amount: amountBigInt,
        chainId: toChainId,
        recipient,
      },
      {
        onEvent: (event: any) => {
          if (onProgress) onProgress(event);
        },
      }
    );
  }

  async getTransferStatus(transactionHash: string) {
    const explorerUrl = `https://nexus.availproject.org/tx/${transactionHash}`;
    try {
      if (typeof (this.sdk as any).getTransactionStatus !== 'function') {
        console.warn('NexusSDK.getTransactionStatus is not available in this SDK version');
        return { status: 'pending', transactionHash, explorerUrl };
      }
      const status = await (this.sdk as any).getTransactionStatus(transactionHash);
      return {
        status: status?.state ?? status?.status ?? 'pending',
        transactionHash,
        explorerUrl,
        steps: status?.steps || [],
      };
    } catch (e) {
      console.error('Failed to fetch transfer status:', e);
      return { status: 'pending', transactionHash, explorerUrl };
    }
  }
}

const nexusNetwork = process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ? 'mainnet' : 'testnet';
export const nexusService = new NexusService(nexusNetwork);
