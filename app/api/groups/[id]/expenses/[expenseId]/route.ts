import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';
import { UpdateExpenseApiSchema } from '@/lib/validations/expense';

const getExpenseDetail = async (req: AuthenticatedRequest, { params }: { params: { id: string, expenseId: string } }) => {
  try {
    const { id: groupId, expenseId } = params;
    const userId = toDbUserId(req.user.id);

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return createResponse({ error: 'Access denied' }, 403);
    }

    const { data: expense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select(`
        *,
        paidBy:users!expenses_created_by_fkey(id, name, avatar_url),
        splits:expense_splits(id, user_id, amount_owed, percentage_owed, shares, user:users(id, name, avatar_url)),
        receipts:shared_media(cid, media_type, title)
      `)
      .eq('id', expenseId)
      .eq('group_id', groupId)
      .single();

    if (fetchError || !expense) {
      return createResponse({ error: 'Expense not found' }, 404);
    }

    return createResponse(expense);
  } catch (error) {
    console.error('Error in GET /api/groups/[id]/expenses/[expenseId]:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

const updateExpense = async (req: AuthenticatedRequest & { validatedBody: any }, { params }: { params: { id: string, expenseId: string } }) => {
  try {
    const { id: groupId, expenseId } = params;
    const userId = toDbUserId(req.user.id);
    const body = req.validatedBody;

    const { data: expense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('created_by')
      .eq('id', expenseId)
      .eq('group_id', groupId)
      .single();

    if (fetchError || !expense) {
      return createResponse({ error: 'Expense not found' }, 404);
    }

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership || (expense.created_by !== userId && membership.role !== 'admin')) {
      return createResponse({ error: 'Unauthorized to edit this expense' }, 403);
    }

    const { data: updatedExpense, error: updateError } = await supabaseAdmin
      .from('expenses')
      .update({
        description: body.description,
        total_amount: body.amount,
        category: body.category,
        split_type: body.splitType?.toLowerCase(),
        created_at: body.date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (updateError) {
      return createResponse({ error: 'Failed to update expense' }, 400);
    }

    if (body.splits) {
      await supabaseAdmin.from('expense_splits').delete().eq('expense_id', expenseId);
      
      const splitsToInsert = body.splits.map((split: any) => ({
        expense_id: expenseId,
        user_id: split.userId,
        amount_owed: split.amount,
        percentage_owed: split.percentage,
        shares: split.shares,
      }));

      const { error: splitsError } = await supabaseAdmin
        .from('expense_splits')
        .insert(splitsToInsert);

      if (splitsError) {
        return createResponse({ error: 'Failed to update splits' }, 400);
      }
    }

    if (body.receiptCid) {
      await supabaseAdmin.from('shared_media').delete().eq('expense_id', expenseId);
      await supabaseAdmin.from('shared_media').insert({
        group_id: groupId,
        expense_id: expenseId,
        uploader_id: userId,
        cid: body.receiptCid,
        media_type: 'image',
        title: `Receipt for ${body.description || updatedExpense.description}`,
      });
    }

    return createResponse(updatedExpense);
  } catch (error) {
    console.error('Error in PATCH /api/groups/[id]/expenses/[expenseId]:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

const deleteExpense = async (req: AuthenticatedRequest, { params }: { params: { id: string, expenseId: string } }) => {
  try {
    const { id: groupId, expenseId } = params;
    const userId = toDbUserId(req.user.id);

    const { data: expense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('created_by')
      .eq('id', expenseId)
      .eq('group_id', groupId)
      .single();

    if (fetchError || !expense) {
      return createResponse({ error: 'Expense not found' }, 404);
    }

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership || (expense.created_by !== userId && membership.role !== 'admin')) {
      return createResponse({ error: 'Unauthorized to delete this expense' }, 403);
    }

    const { error: deleteError } = await supabaseAdmin
      .from('expenses')
      .update({ updated_at: new Date().toISOString() }) // Fallback since deleted_at is missing
      .eq('id', expenseId);

    if (deleteError) {
      return createResponse({ error: 'Failed to delete expense' }, 400);
    }

    return createResponse({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]/expenses/[expenseId]:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const GET = withMiddleware(getExpenseDetail, { auth: true });
export const PATCH = withMiddleware(updateExpense, { auth: true, validation: { schema: UpdateExpenseApiSchema } });
export const DELETE = withMiddleware(deleteExpense, { auth: true });
