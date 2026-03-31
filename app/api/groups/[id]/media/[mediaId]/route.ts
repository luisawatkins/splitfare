import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';

const deleteMedia = async (req: AuthenticatedRequest, { params }: { params: { id: string, mediaId: string } }) => {
  try {
    const groupId = params.id;
    const mediaId = params.mediaId;
    const userId = toDbUserId(req.user.id);

    const { data: media, error: mediaError } = await supabaseAdmin
      .from('shared_media')
      .select('uploader_id')
      .eq('id', mediaId)
      .eq('group_id', groupId)
      .single();

    if (mediaError || !media) {
      return createResponse({ error: 'Media not found' }, 404);
    }

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return createResponse({ error: 'Access denied' }, 403);
    }

    const isAdmin = membership.role === 'admin';
    const isUploader = media.uploader_id === userId;

    if (!isAdmin && !isUploader) {
      return createResponse({ error: 'Only the uploader or an admin can delete media' }, 403);
    }

    const { error: deleteError } = await supabaseAdmin
      .from('shared_media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) {
      return createResponse({ error: deleteError.message }, 500);
    }

    return createResponse({ message: 'Media deleted successfully' });
  } catch (err) {
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const DELETE = withMiddleware(deleteMedia, { auth: true });
