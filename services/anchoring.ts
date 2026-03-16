import { supabaseAdmin } from '@/supabase/admin';
import { GroupBundleService } from './bundle';
import { createServerStorachaService } from '@/lib/storacha-server';
import { createPublicClient, createWalletClient, http, parseAbiItem } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { splitFareCIDRegistryAbi } from '@/lib/contracts/abi';

const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_CID_REGISTRY_ADDRESS as `0x${string}`;
const ANCHOR_PRIVATE_KEY = process.env.ANCHOR_PRIVATE_KEY as `0x${string}`;

export class AnchoringService {
  private bundleService: GroupBundleService;

  constructor(bundleService: GroupBundleService) {
    this.bundleService = bundleService;
  }

  async anchorAllGroups() {
    console.log('Starting daily anchoring for all active groups...');

    // 1. Fetch all groups that had activity since their last anchor
    // For simplicity, we'll fetch all groups for now
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
        
        // 2. Create bundle and upload to Storacha
        const rootCid = await this.bundleService.createBundle(group.id);
        console.log(`Bundle created for ${group.name}. Root CID: ${rootCid}`);

        // 3. Anchor on-chain
        const txHash = await this.anchorOnChain(group.id, rootCid);
        console.log(`Anchored ${group.name} on-chain. TX: ${txHash}`);

        // 4. Update cid_anchors table
        const { error: anchorError } = await supabaseAdmin
          .from('cid_anchors')
          .insert({
            group_id: group.id,
            root_cid: rootCid,
            anchor_tx_hash: txHash,
          });

        if (anchorError) {
          console.error(`Failed to record anchor for ${group.name}:`, anchorError);
        }
      } catch (error) {
        console.error(`Error anchoring group ${group.name}:`, error);
      }
    }

    console.log('Finished anchoring all groups.');
  }

  private async anchorOnChain(groupId: string, cid: string): Promise<string> {
    if (!ANCHOR_PRIVATE_KEY || !REGISTRY_ADDRESS) {
      throw new Error('Anchoring environment variables not configured');
    }

    const account = privateKeyToAccount(ANCHOR_PRIVATE_KEY);
    
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    // The contract uses uint256 for groupId in some places and bytes32 in others 
    // based on the README vs ABI. Let's look at the ABI again.
    // ABI says uint256 groupId.
    // We need to convert UUID to a big integer or similar if the contract expects uint256.
    // UUIDs are 128-bit. We can parse it as a hex and then to BigInt.
    const numericGroupId = BigInt('0x' + groupId.replace(/-/g, ''));

    // Fetch record count (expenses + settlements) for the event/contract
    const [expensesCount, settlementsCount] = await Promise.all([
        supabaseAdmin.from('expenses').select('id', { count: 'exact', head: true }).eq('group_id', groupId),
        supabaseAdmin.from('settlements').select('id', { count: 'exact', head: true }).eq('group_id', groupId).eq('status', 'completed')
    ]);

    const totalRecords = (expensesCount.count || 0) + (settlementsCount.count || 0);

    const { request } = await publicClient.simulateContract({
      address: REGISTRY_ADDRESS,
      abi: splitFareCIDRegistryAbi,
      functionName: 'anchorGroupCID',
      args: [numericGroupId, cid, BigInt(totalRecords)],
      account,
    });

    const hash = await walletClient.writeContract(request);
    
    // Wait for transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  }
}

export async function runDailyAnchoring() {
  const storacha = await createServerStorachaService();
  const bundleService = new GroupBundleService(storacha);
  const anchoringService = new AnchoringService(bundleService);
  await anchoringService.anchorAllGroups();
}
