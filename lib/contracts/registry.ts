import { ethers } from 'ethers';
import { splitFareCIDRegistryAbi } from './abi';

const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_CID_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000';

export function getRegistryContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(REGISTRY_ADDRESS, splitFareCIDRegistryAbi, signerOrProvider);
}

export interface Anchor {
  cid: string;
  timestamp: bigint;
  recordCount: bigint;
}

export class RegistryClient {
  private contract: ethers.Contract;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.contract = getRegistryContract(signer || provider);
  }

  async anchorGroupCID(groupId: bigint, cid: string, recordCount: bigint) {
    // Estimate gas first
    const gasLimit = await this.contract.anchorGroupCID.estimateGas(groupId, cid, recordCount);
    
    // Execute transaction
    const tx = await this.contract.anchorGroupCID(groupId, cid, recordCount, {
      gasLimit: (gasLimit * 120n) / 100n, // 20% buffer
    });
    
    return tx;
  }

  async verifyCID(groupId: bigint, cid: string): Promise<boolean> {
    return await this.contract.verifyCID(groupId, cid);
  }

  async getAnchorHistory(groupId: bigint): Promise<Anchor[]> {
    const history = await this.contract.getAnchorHistory(groupId);
    return history.map((h: any) => ({
      cid: h.cid,
      timestamp: h.timestamp,
      recordCount: h.recordCount,
    }));
  }

  async getLatestAnchor(groupId: bigint): Promise<Anchor | null> {
    try {
      const anchor = await this.contract.getLatestAnchor(groupId);
      return {
        cid: anchor.cid,
        timestamp: anchor.timestamp,
        recordCount: anchor.recordCount,
      };
    } catch (e) {
      return null;
    }
  }
}
