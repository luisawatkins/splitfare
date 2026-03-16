import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { notificationService } from '@/services/notification';
import { toDbUserId } from '@/lib/privy-utils';
import { supabaseAdmin } from '@/supabase/admin';

const nudgeUser = async (req: AuthenticatedRequest, { params }: { params: { id: string; userId: string } }) => {
  try {
    const groupId = params.id;
    const receiverId = params.userId;
    const senderId = toDbUserId(req.user.id);

    // Get group info
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return createResponse({ error: 'Group not found' }, 404);
    }

    // Get sender info
    const { data: sender, error: senderError } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return createResponse({ error: 'Sender not found' }, 404);
    }

    // Check rate limit (1 per 24 hours)
    const latestNudge = await notificationService.getLatestNudge(senderId, receiverId, groupId);
    if (latestNudge) {
      const hoursSinceLastNudge = (Date.now() - latestNudge.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastNudge < 24) {
        return createResponse({ error: 'You can only send one nudge every 24 hours.' }, 429);
      }
    }

    // Create notification
    await notificationService.createNotification({
      userId: receiverId,
      type: 'payment_reminder',
      title: 'Payment Reminder',
      message: `${sender.name} sent you a payment reminder in ${group.name}`,
      data: {
        groupId,
        groupName: group.name,
        senderId,
        senderName: sender.name,
      },
    });

    return createResponse({ success: true });
  } catch (error) {
    console.error('Error in POST /api/groups/[id]/remind/[userId]:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const POST = withMiddleware(nudgeUser, { auth: true });
