import { supabaseAdmin } from '@/supabase/admin';
import { GroupBundleService } from './bundle';
import { AnchoringService } from './anchoring';
import { createServerStorachaService } from '@/lib/storacha-server';

const MAX_BUNDLE_RETRIES = 3;

export class BundleSchedulerService {
  private bundleService: GroupBundleService;
  private anchoringService: AnchoringService;

  constructor(bundleService: GroupBundleService, anchoringService: AnchoringService) {
    this.bundleService = bundleService;
    this.anchoringService = anchoringService;
  }

  async runScheduledBundling() {
    console.log('[BundleScheduler] Starting scheduled bundling pipeline...');

    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('groups')
      .select('id, name');

    if (groupsError) {
      console.error('[BundleScheduler] Failed to fetch groups:', groupsError);
      return;
    }

    console.log(`[BundleScheduler] Processing ${groups.length} groups.`);

    for (const group of groups) {
      try {
        await this.processGroupBundle(group.id, group.name);
      } catch (error) {
        console.error(`[BundleScheduler] Error processing group ${group.name}:`, error);
      }
    }

    console.log('[BundleScheduler] Scheduled bundling pipeline finished.');
  }

  async processGroupBundle(groupId: string, groupName: string, isManual: boolean = false) {
    console.log(`[BundleScheduler] Checking for changes in group: ${groupName} (${groupId})`);

    const { data: lastAnchor } = await supabaseAdmin
      .from('cid_anchors')
      .select('created_at')
      .eq('group_id', groupId)
      .eq('status', 'ANCHORED')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastBundleDate = lastAnchor?.created_at || new Date(0).toISOString();

    const [newExpenses, newSettlements] = await Promise.all([
      supabaseAdmin
        .from('expenses')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .gt('updated_at', lastBundleDate),
      supabaseAdmin
        .from('settlements')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('status', 'completed')
        .gt('updated_at', lastBundleDate)
    ]);

    const hasChanges = (newExpenses.count || 0) > 0 || (newSettlements.count || 0) > 0;

    if (!hasChanges && !isManual) {
      console.log(`[BundleScheduler] No changes for group ${groupName}, skipping.`);
      return null;
    }

    console.log(`[BundleScheduler] Changes detected for ${groupName}. Starting bundle process.`);

    const { data: anchorRecord, error: insertError } = await supabaseAdmin
      .from('cid_anchors')
      .insert({
        group_id: groupId,
        status: 'PENDING',
        record_count: (newExpenses.count || 0) + (newSettlements.count || 0)
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const recordId = anchorRecord.id;

    try {
      await this.updateStatus(recordId, 'UPLOADING');
      
      let rootCid: string | null = null;
      let retryCount = 0;
      
      while (retryCount < MAX_BUNDLE_RETRIES) {
        try {
          rootCid = await this.bundleService.createBundle(groupId);
          break;
        } catch (error) {
          retryCount++;
          console.warn(`[BundleScheduler] Upload retry ${retryCount}/${MAX_BUNDLE_RETRIES} for ${groupName}`);
          if (retryCount >= MAX_BUNDLE_RETRIES) throw error;
          await new Promise(r => setTimeout(r, 1000 * retryCount));
        }
      }

      await this.updateStatus(recordId, 'UPLOADED', { root_cid: rootCid });

      await this.updateStatus(recordId, 'ANCHORING');
      

      const [totalExpenses, totalSettlements] = await Promise.all([
        supabaseAdmin.from('expenses').select('id', { count: 'exact', head: true }).eq('group_id', groupId),
        supabaseAdmin.from('settlements').select('id', { count: 'exact', head: true }).eq('group_id', groupId).eq('status', 'completed')
      ]);
      const totalCount = (totalExpenses.count || 0) + (totalSettlements.count || 0);

      const receipt = await this.anchoringService.anchorWithRetry(groupId, rootCid!, totalCount);

      await this.updateStatus(recordId, 'ANCHORED', {
        anchor_tx_hash: receipt.hash,
        anchored_at: new Date().toISOString(),
        record_count: totalCount,
        chain: 'base-sepolia'
      });

      await this.notifyAdmins(groupId, groupName, rootCid!);

      return rootCid;
    } catch (error: any) {
      console.error(`[BundleScheduler] Bundle pipeline failed for ${groupName}:`, error.message);
      await this.updateStatus(recordId, 'FAILED', { 
        error_message: error.message,
        retry_count: MAX_BUNDLE_RETRIES 
      });
      throw error;
    }
  }

  private async updateStatus(id: string, status: string, extra: any = {}) {
    const { error } = await supabaseAdmin
      .from('cid_anchors')
      .update({ status, ...extra, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) console.error(`[BundleScheduler] Failed to update status to ${status}:`, error);
  }

  private async notifyAdmins(groupId: string, groupName: string, rootCid: string) {
    console.log(`[BundleScheduler] NOTIFY: Bundle anchored for ${groupName}. Root CID: ${rootCid}`);
    
    const { data: admins } = await supabaseAdmin
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('role', 'admin');

    if (admins) {
      await Promise.all(admins.map(admin => 
        supabaseAdmin.from('notifications').insert({
          user_id: admin.user_id,
          title: 'Data Bundle Anchored',
          message: `Your group "${groupName}" data has been securely bundled and anchored on-chain. CID: ${rootCid.slice(0, 10)}...`,
          type: 'bundle_success',
          metadata: { groupId, rootCid }
        })
      ));
    }
  }
}

export async function createBundleScheduler() {
  const storacha = await createServerStorachaService();
  const bundleService = new GroupBundleService(storacha);
  const anchoringService = new AnchoringService(bundleService);
  return new BundleSchedulerService(bundleService, anchoringService);
}
