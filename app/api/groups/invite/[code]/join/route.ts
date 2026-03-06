import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';

const joinGroupByInviteCode = async (req: AuthenticatedRequest, { params }: { params: { code: string } }) => {
  try {
    const { code } = params;
    const userId = toDbUserId(req.user.id);

    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('id')
      .eq('invite_code', code)
      .single();

    if (groupError || !group) {
      return createResponse({ error: 'Invalid invite code' }, 404);
    }

    const { data: existingMember, error: memberCheckError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return createResponse({ error: 'Already a member', groupId: group.id }, 400);
    }

    const { error: joinError } = await supabaseAdmin
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'member',
      });

    if (joinError) {
      console.error('Error joining group:', joinError);
      return createResponse({ error: 'Failed to join group' }, 500);
    }

    return createResponse({ success: true, groupId: group.id }, 200);
  } catch (error) {
    console.error('Error in POST /api/groups/invite/[code]/join:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const POST = withMiddleware(joinGroupByInviteCode, { auth: true });
