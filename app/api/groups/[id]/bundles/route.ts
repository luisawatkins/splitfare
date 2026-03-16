import { withAuth, createResponse, createErrorResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { createBundleScheduler } from '@/services/bundle-scheduler';
import { toDbUserId } from '@/lib/privy-utils';

const getBundleHistory = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const groupId = params.id;
    const userId = toDbUserId(req.user.id);

    // 1. Verify group membership
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return createErrorResponse(new Error('Access denied or group not found'));
    }

    // 2. Fetch history from DB
    const { data: bundles, error: fetchError } = await supabaseAdmin
      .from('cid_anchors')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    return createResponse(bundles);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const triggerManualBundle = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const groupId = params.id;
    const userId = toDbUserId(req.user.id);

    // 1. Verify group admin role
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('role, groups(name)')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership || membership.role !== 'admin') {
      return createErrorResponse(new Error('Admin access required'));
    }

    const groupName = (membership.groups as any).name;

    // 2. Trigger manual bundle via scheduler
    const scheduler = await createBundleScheduler();
    const rootCid = await scheduler.processGroupBundle(groupId, groupName, true);

    return createResponse({
      message: 'Manual bundle triggered successfully',
      rootCid
    });
  } catch (error) {
    console.error('Manual bundle failed:', error);
    return createErrorResponse(error);
  }
};

export const GET = withAuth(getBundleHistory);
export const POST = withAuth(triggerManualBundle);
