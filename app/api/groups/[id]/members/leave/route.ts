import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';


const leaveGroup = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const groupId = params.id;
    const userId = toDbUserId(req.user.id);

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return createResponse({ error: 'User is not a member of the group' }, 404);
    }

    if (membership.role === 'owner') {
      return createResponse({ error: 'Group owners must transfer ownership before leaving' }, 403);
    }

    const { error: deleteError } = await supabaseAdmin
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (deleteError) {
      return createResponse({ error: 'Failed to leave group' }, 400);
    }


    return createResponse({ success: true, message: 'Left group successfully' });
  } catch (error) {
    console.error('Error in POST /api/groups/[id]/members/leave:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const POST = withMiddleware(leaveGroup, { auth: true });
