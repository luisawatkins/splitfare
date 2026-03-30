import { withMiddleware, createResponse, createErrorResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';
import { CreateExpenseApiSchema, ExpenseFilterSchema } from '@/lib/validations/expense';
import { ForbiddenError, AppError } from '@/lib/errors';
import { notificationService } from '@/services/notification';


const listExpenses = async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const groupId = params.id;
    const userId = toDbUserId(req.user.id);
    const { searchParams } = new URL(req.url);

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      throw new ForbiddenError('Access denied');
    }

    const filterParams = {
      category: searchParams.get('category') || undefined,
      paidBy: searchParams.get('paidBy') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'date',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      limit: parseInt(searchParams.get('limit') || '20'),
      cursor: searchParams.get('cursor') || undefined,
    };

    const validatedFilters = ExpenseFilterSchema.parse(filterParams);

    const baseSelect = `
      *,
      paidBy:users!expenses_created_by_fkey(id, name, avatar_url),
      splits:expense_splits(id, user_id, amount_owed, percentage_owed, shares)
    `;
    const buildQuery = (withSoftDeleteFilter: boolean) => {
      let q = supabaseAdmin
        .from('expenses')
        .select(baseSelect)
        .eq('group_id', groupId);
      if (withSoftDeleteFilter) {
        q = q.is('deleted_at', null);
      }
      return q;
    };

    let query = buildQuery(true);

    if (validatedFilters.category) {
      query = query.eq('category', validatedFilters.category);
    }
    if (validatedFilters.paidBy) {
      query = query.eq('created_by', validatedFilters.paidBy);
    }
    if (validatedFilters.startDate) {
      query = query.gte('created_at', validatedFilters.startDate);
    }
    if (validatedFilters.endDate) {
      query = query.lte('created_at', validatedFilters.endDate);
    }

    if (validatedFilters.cursor) {
      if (validatedFilters.sortOrder === 'desc') {
        query = query.lt('created_at', validatedFilters.cursor);
      } else {
        query = query.gt('created_at', validatedFilters.cursor);
      }
    }

    query = query
      .order(validatedFilters.sortBy === 'date' ? 'created_at' : 'total_amount', {
        ascending: validatedFilters.sortOrder === 'asc',
      })
      .limit(validatedFilters.limit + 1); 

    let { data: expenses, error: fetchError } = await query;

    if (fetchError && (fetchError as any).code === '42703') {
      query = buildQuery(false);

      if (validatedFilters.category) {
        query = query.eq('category', validatedFilters.category);
      }
      if (validatedFilters.paidBy) {
        query = query.eq('created_by', validatedFilters.paidBy);
      }
      if (validatedFilters.startDate) {
        query = query.gte('created_at', validatedFilters.startDate);
      }
      if (validatedFilters.endDate) {
        query = query.lte('created_at', validatedFilters.endDate);
      }
      if (validatedFilters.cursor) {
        if (validatedFilters.sortOrder === 'desc') {
          query = query.lt('created_at', validatedFilters.cursor);
        } else {
          query = query.gt('created_at', validatedFilters.cursor);
        }
      }
      query = query
        .order(validatedFilters.sortBy === 'date' ? 'created_at' : 'total_amount', {
          ascending: validatedFilters.sortOrder === 'asc',
        })
        .limit(validatedFilters.limit + 1);

      const fallback = await query;
      expenses = fallback.data;
      fetchError = fallback.error;
    }

    if (fetchError) {
      console.error('Error fetching expenses:', fetchError);
      throw new AppError('Failed to fetch expenses', 400);
    }

    const safeExpenses = expenses || [];
    const hasNextPage = safeExpenses.length > validatedFilters.limit;
    const paginatedExpenses = hasNextPage ? safeExpenses.slice(0, -1) : safeExpenses;
    const nextCursor = hasNextPage && paginatedExpenses.length > 0 ? paginatedExpenses[paginatedExpenses.length - 1].created_at : null;

    return createResponse({
      items: paginatedExpenses,
      nextCursor,
      hasNextPage,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
};

const createExpense = async (req: AuthenticatedRequest & { validatedBody: any }, { params }: { params: { id: string } }) => {
  try {
    const groupId = params.id;
    const userId = toDbUserId(req.user.id);
    const body = req.validatedBody;

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return createResponse({ error: 'Access denied' }, 403);
    }

    const { data: expense, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .insert({
        group_id: groupId,
        created_by: body.paidById,
        description: body.description,
        total_amount: body.amount,
        category: body.category,
        split_type: body.splitType.toLowerCase(),
        created_at: body.date,
      })
      .select()
      .single();

    if (expenseError) {
      console.error('Error creating expense:', expenseError);
      return createResponse({ error: 'Failed to create expense' }, 400);
    }

    const splitsToInsert = body.splits.map((split: any) => ({
      expense_id: expense.id,
      user_id: split.userId,
      amount_owed: split.amount,
      percentage_owed: split.percentage,
      shares: split.shares,
    }));

    const { error: splitsError } = await supabaseAdmin
      .from('expense_splits')
      .insert(splitsToInsert);

    if (splitsError) {
      console.error('Error creating splits:', splitsError);
      await supabaseAdmin.from('expenses').delete().eq('id', expense.id);
      return createResponse({ error: 'Failed to create expense splits' }, 400);
    }

    if (body.receiptCid) {
      await supabaseAdmin.from('shared_media').insert({
        group_id: groupId,
        expense_id: expense.id,
        uploader_id: userId,
        cid: body.receiptCid,
        media_type: 'image',
        title: `Receipt for ${body.description}`,
      });
    }

    // Trigger notifications for all group members except the one who paid
    const { data: members } = await supabaseAdmin
      .from('group_members')
      .select('user_id, groups(name), users!group_members_user_id_fkey(name)')
      .eq('group_id', groupId);

    if (members) {
      const payerName = members.find(m => m.user_id === body.paidById)?.users?.[0]?.name || 'Someone';
      const groupName = (members[0]?.groups as any)?.name || 'the group';

      const notificationPromises = members
        .filter(m => m.user_id !== body.paidById)
        .map(m => 
          notificationService.createNotification({
            userId: m.user_id,
            type: 'expense_added',
            title: 'New Expense',
            message: `${payerName} added "${body.description}" to ${groupName}`,
            data: {
              groupId,
              expenseId: expense.id,
              groupName,
              amount: body.amount,
              currency: body.currency,
            },
          })
        );
      
      Promise.all(notificationPromises).catch(err => console.error('Failed to send expense notifications:', err));
    }

    return createResponse(expense, 201);
  } catch (error) {
    console.error('Error in POST /api/groups/[id]/expenses:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
};

export const GET = withMiddleware(listExpenses, { auth: true });
export const POST = withMiddleware(createExpense, { auth: true, validation: { schema: CreateExpenseApiSchema } });
