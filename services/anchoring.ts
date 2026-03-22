import { supabaseAdmin } from '@/supabase/admin';
import { GroupBundleService } from './bundle';
import { createServerStorachaService } from '@/lib/storacha-server';
import { ethers, JsonRpcProvider, Wallet, Contract, TransactionResponse } from 'ethers';
import { splitFareCIDRegistryAbi } from '@/lib/contracts/abi';

const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_CID_REGISTRY_ADDRESS as string;
const ANCHOR_PRIVATE_KEY = process.env.ANCHOR_PRIVATE_KEY as string;
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export class AnchoringService {
  private bundleService: GroupBundleService;
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: Contract;

  constructor(bundleService: GroupBundleService) {
    this.bundleService = bundleService;
    
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
    const anchorKey = process.env.ANCHOR_PRIVATE_KEY;
    const registryAddress = process.env.NEXT_PUBLIC_CID_REGISTRY_ADDRESS;

    if (!anchorKey) {
      throw new Error('ANCHOR_PRIVATE_KEY is not configured');
    }
    
    if (!registryAddress) {
      throw new Error('NEXT_PUBLIC_CID_REGISTRY_ADDRESS is not configured');
    }

    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(anchorKey, this.provider);
    this.contract = new Contract(registryAddress, splitFareCIDRegistryAbi, this.wallet);
  }

  async anchorAllGroups() {
    console.log('Starting daily anchoring for all active groups...');

    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('groups')
      .select('id, name');

    if (groupsError) {
      console.error('Failed to fetch groups for anchoring:', groupsError);
      return;
    }

    console.log(`Found ${groups.length} groups to process.`);

    for (const group of groups) {
      try {
        console.log(`Processing group: ${group.name} (${group.id})`);
        
        const rootCid = await this.bundleService.createBundle(group.id);
        console.log(`Bundle created for ${group.name}. Root CID: ${rootCid}`);

        // Fetch record count (expenses + settlements)
        const [expensesCount, settlementsCount] = await Promise.all([
          supabaseAdmin.from('expenses').select('id', { count: 'exact', head: true }).eq('group_id', group.id).is('deleted_at', null),
          supabaseAdmin.from('settlements').select('id', { count: 'exact', head: true }).eq('group_id', group.id).eq('status', 'completed')
        ]);
        const totalRecords = (expensesCount.count || 0) + (settlementsCount.count || 0);

        const txReceipt = await this.anchorWithRetry(group.id, rootCid, totalRecords);
        console.log(`Anchored ${group.name} on-chain. TX: ${txReceipt.hash}`);

        // Update cid_anchors table
        const { error: anchorError } = await supabaseAdmin
          .from('cid_anchors')
          .insert({
            group_id: group.id,
            root_cid: rootCid,
            anchor_tx_hash: txReceipt.hash,
            chain: 'base-sepolia',
            record_count: totalRecords
          });

        if (anchorError) {
          console.error(`Failed to record anchor in DB for ${group.name}:`, anchorError);
        }
      } catch (error) {
        console.error(`Error anchoring group ${group.name}:`, error);
      }
    }

    console.log('Finished anchoring all groups.');
  }

  async anchorWithRetry(groupId: string, cid: string, recordCount: number): Promise<any> {
    let lastError: any;
    const numericGroupId = BigInt('0x' + groupId.replace(/-/g, ''));

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // Estimate gas before submission
        const gasEstimate = await this.contract.anchorGroupCID.estimateGas(
          numericGroupId,
          cid,
          BigInt(recordCount)
        );

        const tx: TransactionResponse = await this.contract.anchorGroupCID(
          numericGroupId,
          cid,
          BigInt(recordCount),
          {
            gasLimit: (gasEstimate * 120n) / 100n, // 20% buffer
          }
        );

        const receipt = await tx.wait();
        if (!receipt) throw new Error('Transaction failed: No receipt');
        return receipt;
      } catch (error: any) {
        lastError = error;
        console.warn(`Anchoring attempt ${i + 1} failed for group ${groupId}:`, error.message);
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
        }
      }
    }

    throw lastError;
  }

  async verifyAnchor(groupId: string, cid: string): Promise<boolean> {
    const numericGroupId = BigInt('0x' + groupId.replace(/-/g, ''));
    return await this.contract.verifyCID(numericGroupId, cid);
  }

  async getAnchorHistory(groupId: string) {
    const numericGroupId = BigInt('0x' + groupId.replace(/-/g, ''));
    const history = await this.contract.getAnchorHistory(numericGroupId);
    return history.map((h: any) => ({
      cid: h.cid,
      timestamp: Number(h.timestamp),
      recordCount: Number(h.recordCount),
    }));
  }
}

export async function runDailyAnchoring() {
  const storacha = await createServerStorachaService();
  const bundleService = new GroupBundleService(storacha);
  const anchoringService = new AnchoringService(bundleService);
  await anchoringService.anchorAllGroups();
}
