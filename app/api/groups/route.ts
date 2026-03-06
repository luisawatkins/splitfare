import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { CreateGroupSchema } from '@/lib/validations';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';
import { nanoid } from 'nanoid';
import { createServerStorachaService } from '@/lib/storacha-server';

const getGroups = async (req: AuthenticatedRequest) => {
  const userId = toDbUserId(req.user.id);

  const { data: groups, error } = await supabaseAdmin
    .from('groups')
    .select(`
      *,
      members:group_members!inner(user_id)
    `)
    .eq('group_members.user_id', userId);

  if (error) {
    console.error('Error fetching groups:', error);
    return createResponse([], 500);
  }

  return createResponse(groups);
};

const createGroup = async (req: AuthenticatedRequest & { validatedBody: any }) => {
  try {
    const { name, description, category, avatar_url } = req.validatedBody;
    const userId = toDbUserId(req.user.id);
    const inviteCode = nanoid(8);

    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .insert({
        name,
        description,
        category,
        avatar_url,
        invite_code: inviteCode,
        created_by: userId,
      })
      .select()
      .single();

    if (groupError) {
      console.error('Error creating group:', groupError);
      return createResponse({ error: 'Failed to create group' }, 400);
    }

    const { error: memberError } = await supabaseAdmin
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'admin',
      });

    if (memberError) {
      console.error('Error adding creator to group:', memberError);
    }

    let spaceDid = null;
    try {
      const storacha = await createServerStorachaService();
      const spaceName = `splitfare-group-${group.id}`;
      const space = await storacha.createSpace(spaceName) as { did: () => string } | { did: string } | any;
      
      spaceDid = typeof space?.did === 'function' ? space.did() : space?.did || space?.toString();

      if (spaceDid) {
        await supabaseAdmin
          .from('groups')
          .update({ space_did: spaceDid })
          .eq('id', group.id);
        
        group.space_did = spaceDid;
      }
    } catch (storachaError) {
      console.error('Error creating Storacha space:', storachaError);
    }

    return createResponse(group, 201);
  } catch (error) {
    console.error('Error in POST /api/groups:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const GET = withMiddleware(getGroups, { auth: true });
export const POST = withMiddleware(createGroup, { 
  auth: true, 
  validation: { schema: CreateGroupSchema } 
});
