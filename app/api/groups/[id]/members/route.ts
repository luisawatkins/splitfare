import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';

const getGroupMembers = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const groupId = params.id;
    const userId = toDbUserId(req.user.id);

    const { data: membership, error: memberCheckError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberCheckError || !membership) {
      return createResponse({ error: 'Unauthorized' }, 403);
    }

    // 2. Fetch all members with their profiles
    const { data: members, error: membersError } = await supabaseAdmin
      .from('group_members')
      .select(`
        id,
        role,
        joined_at,
        user:users (
          id,
          name,
          username,
          ens_name,
          avatar_url,
          wallet_address
        )
      `)
      .eq('group_id', groupId);

    if (membersError) {
      console.error('Error fetching group members:', membersError);
      return createResponse({ error: 'Failed to fetch members' }, 500);
    }

    const membersWithBalances = members.map(m => ({
      ...m,
      balance: 0 
    }));

    return createResponse(membersWithBalances);
  } catch (error) {
    console.error('Error in GET /api/groups/[id]/members:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const GET = withMiddleware(getGroupMembers, { auth: true });
