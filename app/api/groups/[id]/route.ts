import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';

const getGroup = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const userId = toDbUserId(req.user.id);

    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .select(`
        *,
        members:group_members!inner(*)
      `)
      .eq('id', id)
      .eq('group_members.user_id', userId)
      .single();

    if (error || !group) {
      console.error('Error fetching group:', error);
      return createResponse({ error: 'Group not found or access denied' }, 404);
    }

    return createResponse(group);
  } catch (error) {
    console.error('Error in GET /api/groups/[id]:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

const updateGroup = async (req: AuthenticatedRequest & { validatedBody: any }, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const userId = toDbUserId(req.user.id);
    const updates = req.validatedBody;

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', id)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership || membership.role !== 'admin') {
      return createResponse({ error: 'Unauthorized' }, 403);
    }

    const { data: group, error: updateError } = await supabaseAdmin
      .from('groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return createResponse({ error: 'Failed to update group' }, 400);
    }

    return createResponse(group);
  } catch (error) {
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const GET = withMiddleware(getGroup, { auth: true });
export const PATCH = withMiddleware(updateGroup, { auth: true });
