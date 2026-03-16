import { withAuth, createResponse, createErrorResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { VerifierService } from '@/services/verifier';
import { toDbUserId } from '@/lib/privy-utils';
import { supabaseAdmin } from '@/supabase/admin';

const verifyGroup = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
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

    // 2. Run verification
    const verifier = new VerifierService();
    const report = await verifier.verifyGroupData(groupId);

    return createResponse(report);
  } catch (error) {
    console.error('Error in verification API:', error);
    return createErrorResponse(error);
  }
};

const getAuditTrail = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
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

    // 2. Fetch audit trail
    const verifier = new VerifierService();
    const timeline = await verifier.getAuditTrail(groupId);

    return createResponse(timeline);
  } catch (error) {
    return createErrorResponse(error);
  }
};

export const POST = withAuth(verifyGroup);
export const GET = withAuth(getAuditTrail);
