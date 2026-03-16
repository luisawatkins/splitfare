import { withAuth, createResponse, createErrorResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { AnchoringService } from '@/services/anchoring';
import { GroupBundleService } from '@/services/bundle';
import { createServerStorachaService } from '@/lib/storacha-server';
import { toDbUserId } from '@/lib/privy-utils';

const triggerAnchor = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const groupId = params.id;
    const userId = toDbUserId(req.user.id);

    // 1. Verify group admin status
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership || membership.role !== 'admin') {
      return createErrorResponse(new Error('Access denied: Admin only'));
    }

    // 2. Initialize services
    const storacha = await createServerStorachaService();
    const bundleService = new GroupBundleService(storacha);
    const anchoringService = new AnchoringService(bundleService);

    // 3. Create bundle and upload
    const rootCid = await bundleService.createBundle(groupId);

    // 4. Fetch record count
    const [expensesCount, settlementsCount] = await Promise.all([
      supabaseAdmin.from('expenses').select('id', { count: 'exact', head: true }).eq('group_id', groupId),
      supabaseAdmin.from('settlements').select('id', { count: 'exact', head: true }).eq('group_id', groupId).eq('status', 'completed')
    ]);
    const totalRecords = (expensesCount.count || 0) + (settlementsCount.count || 0);

    // 5. Anchor on-chain with retry logic
    const txReceipt = await anchoringService.anchorWithRetry(groupId, rootCid, totalRecords);

    // 6. Record in DB
    const { error: anchorError } = await supabaseAdmin
      .from('cid_anchors')
      .insert({
        group_id: groupId,
        root_cid: rootCid,
        anchor_tx_hash: txReceipt.hash,
        chain: 'base-sepolia',
        record_count: totalRecords
      });

    if (anchorError) {
      console.error('Failed to record anchor in DB:', anchorError);
    }

    return createResponse({
      rootCid,
      txHash: txReceipt.hash,
      recordCount: totalRecords,
      message: 'Group data successfully anchored on Base Sepolia'
    });
  } catch (error) {
    console.error('Error in anchoring API:', error);
    return createErrorResponse(error);
  }
};

const getHistory = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const groupId = params.id;
    const userId = toDbUserId(req.user.id);

    // Verify membership
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return createErrorResponse(new Error('Access denied'));
    }

    // Use DB records for history as it's faster than querying chain for full history
    const { data: anchors, error: anchorError } = await supabaseAdmin
      .from('cid_anchors')
      .select('*')
      .eq('group_id', groupId)
      .order('anchored_at', { ascending: false });

    if (anchorError) {
      throw anchorError;
    }

    return createResponse(anchors);
  } catch (error) {
    return createErrorResponse(error);
  }
};

export const POST = withAuth(triggerAnchor);
export const GET = withAuth(getHistory);
