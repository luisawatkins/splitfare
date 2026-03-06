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

    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select(`
        id,
        total_amount,
        created_by,
        splits:expense_splits(user_id, amount_owed)
      `)
      .eq('group_id', groupId);

    if (expensesError) {
      console.error('Error fetching expenses for balance:', expensesError);
      return createResponse({ error: 'Failed to fetch balances' }, 500);
    }

    const { data: settlements, error: settlementsError } = await supabaseAdmin
      .from('settlements')
      .select('payer_id, payee_id, amount')
      .eq('group_id', groupId)
      .eq('status', 'completed');

    if (settlementsError) {
      console.error('Error fetching settlements for balance:', settlementsError);
      return createResponse({ error: 'Failed to fetch balances' }, 500);
    }

    const balances: Record<string, number> = {};
    
    members.forEach(m => {
      const user = m.user as any;
      if (user?.id) balances[user.id] = 0;
    });

    expenses?.forEach(expense => {
      const creatorId = expense.created_by;
      
      if (balances[creatorId] !== undefined) {
        balances[creatorId] += Number(expense.total_amount);
      }

      expense.splits?.forEach(split => {
        if (balances[split.user_id] !== undefined) {
          balances[split.user_id] -= Number(split.amount_owed);
        }
      });
    });

    settlements?.forEach(settlement => {
      if (balances[settlement.payer_id] !== undefined) {
        balances[settlement.payer_id] += Number(settlement.amount);
      }
      if (balances[settlement.payee_id] !== undefined) {
        balances[settlement.payee_id] -= Number(settlement.amount);
      }
    });

    const membersWithBalances = members.map(m => {
      const user = m.user as any;
      return {
        ...m,
        balance: user?.id ? (balances[user.id] || 0) : 0
      };
    });

    return createResponse(membersWithBalances);
  } catch (error) {
    console.error('Error in GET /api/groups/[id]/members:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const GET = withMiddleware(getGroupMembers, { auth: true });
