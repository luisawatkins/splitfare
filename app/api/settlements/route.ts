import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { CreateSettlementSchema } from '@/lib/validations';
import { supabaseAdmin } from '@/supabase/admin';
import { notificationService } from '@/services/notification';
import { toDbUserId } from '@/lib/privy-utils';

const getSettlements = async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const userId = toDbUserId(req.user.id);

    let query = supabaseAdmin
      .from('settlements')
      .select(`
        *,
        payer:users!settlements_payer_id_fkey(id, name, avatar_url),
        payee:users!settlements_payee_id_fkey(id, name, avatar_url)
      `);

    if (groupId) {
      query = query.eq('group_id', groupId);
    } else {
      query = query.or(`payer_id.eq.${userId},payee_id.eq.${userId}`);
    }

    const { data: settlements, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching settlements:', error);
      return createResponse({ error: 'Failed to fetch settlements' }, 400);
    }

    return createResponse(settlements);
  } catch (error) {
    console.error('Error in GET /api/settlements:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

const createSettlement = async (req: AuthenticatedRequest & { validatedBody: any }) => {
  try {
    const body = req.validatedBody;
    const userId = toDbUserId(req.user.id);

    // Verify the authenticated user is the payer
    if (body.payerId !== userId) {
      return createResponse({ error: 'You can only create settlements where you are the payer' }, 403);
    }

    // Verify the user is a member of the group
    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', body.groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return createResponse({ error: 'Access denied: not a member of this group' }, 403);
    }
    const { data: settlement, error } = await supabaseAdmin
      .from('settlements')
      .insert({
        group_id: body.groupId,
        payer_id: body.payerId,
        payee_id: body.payeeId,
        amount: body.amount,
        currency: body.currency || 'USDC',
        status: body.status || 'pending',
        tx_hash: body.txHash,
        chain: body.chain,
      })
      .select(`
        *,
        payer:users!settlements_payer_id_fkey(name),
        payee:users!settlements_payee_id_fkey(name),
        group:groups(name)
      `)
      .single();

    if (error) {
      console.error('Error creating settlement:', error);
      return createResponse({ error: 'Failed to create settlement' }, 400);
    }

    // Trigger notification for the payee
    if (settlement.payee_id !== userId) {
      const payerName = (settlement.payer as any)?.name || 'Someone';
      const groupName = (settlement.group as any)?.name || 'a group';

      notificationService.createNotification({
        userId: settlement.payee_id,
        type: 'settlement_received',
        title: 'Settlement Received',
        message: `${payerName} settled ${settlement.amount} ${settlement.currency} in ${groupName}`,
        data: {
          groupId: settlement.group_id,
          settlementId: settlement.id,
          groupName,
          amount: settlement.amount,
          currency: settlement.currency,
          senderId: userId,
          senderName: payerName,
        },
      }).catch(err => console.error('Failed to send settlement notification:', err));
    }

    return createResponse(settlement, 201);
  } catch (error) {
    console.error('Error in POST /api/settlements:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const GET = withMiddleware(getSettlements, { auth: true });
export const POST = withMiddleware(createSettlement, { 
  auth: true, 
  validation: { schema: CreateSettlementSchema } 
});
