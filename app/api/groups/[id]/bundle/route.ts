import { withAuth, createResponse, createErrorResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';

const getLatestBundle = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
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

    // 2. Fetch latest successful anchor from DB
    const { data: bundle, error: fetchError } = await supabaseAdmin
      .from('cid_anchors')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'ANCHORED')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    return createResponse(bundle || null);
  } catch (error) {
    return createErrorResponse(error);
  }
};

export const GET = withAuth(getLatestBundle);
