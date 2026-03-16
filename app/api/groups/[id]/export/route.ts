import { withAuth, createResponse, createErrorResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { GroupBundleService } from '@/services/bundle';
import { createServerStorachaService } from '@/lib/storacha-server';
import { toDbUserId } from '@/lib/privy-utils';

const exportGroupData = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
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

    // 2. Initialize services
    const storacha = await createServerStorachaService();
    const bundleService = new GroupBundleService(storacha);

    // 3. Create bundle and upload
    const rootCid = await bundleService.createBundle(groupId);

    // 4. Return the CID and a download link (via Storacha gateway)
    return createResponse({
      rootCid,
      downloadUrl: `https://w3s.link/ipfs/${rootCid}`,
      message: 'Group data successfully exported to Storacha'
    });
  } catch (error) {
    console.error('Error exporting group data:', error);
    return createErrorResponse(error);
  }
};

export const GET = withAuth(exportGroupData);
