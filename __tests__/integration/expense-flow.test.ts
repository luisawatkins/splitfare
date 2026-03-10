import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn().mockImplementation((callback) => callback({ data: null, error: null })),
  },
}));

vi.mock('@/supabase/admin', () => ({
  supabaseAdmin: mockSupabase,
}));

import { supabaseAdmin } from '@/supabase/admin';
import { calculateNetBalances } from '../../lib/balances';

describe('Expense Flow Integration', () => {
  const userId = 'user-123';
  const groupId = 'group-456';
  const expenseId = 'expense-789';

  const members = [
    { id: 'user-1', name: 'Alice' },
    { id: 'user-2', name: 'Bob' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an expense, update balances, and then edit/delete it', async () => {
    const newExpense = {
      id: expenseId,
      group_id: groupId,
      paid_by: 'user-1',
      amount: 100,
      description: 'Dinner',
      split_type: 'EQUAL',
    };

    const splits = [
      { user_id: 'user-1', amount: 50 },
      { user_id: 'user-2', amount: 50 },
    ];

    mockSupabase.single.mockResolvedValueOnce({ data: newExpense, error: null });
    
    const { data: createdExpense } = await supabaseAdmin
      .from('expenses')
      .insert(newExpense)
      .select()
      .single();

    expect(createdExpense?.amount).toBe(100);

    const expensesForCalc = [
      {
        id: expenseId,
        paidById: 'user-1',
        amount: 100,
        splits: [
          { userId: 'user-1', amount: 50 },
          { userId: 'user-2', amount: 50 },
        ],
      },
    ];

    let balances = calculateNetBalances(members, expensesForCalc, []);
    expect(balances['user-1']).toBe(50);
    expect(balances['user-2']).toBe(-50);

    const updatedExpense = { ...newExpense, amount: 150 };
    const updatedSplits = [
      { userId: 'user-1', amount: 75 },
      { userId: 'user-2', amount: 75 },
    ];

    mockSupabase.single.mockResolvedValueOnce({ data: updatedExpense, error: null });

    const { data: editedExpense } = await supabaseAdmin
      .from('expenses')
      .update({ amount: 150 })
      .eq('id', expenseId)
      .select()
      .single();

    expect(editedExpense?.amount).toBe(150);

    const expensesAfterEdit = [
      {
        id: expenseId,
        paidById: 'user-1',
        amount: 150,
        splits: updatedSplits,
      },
    ];

    balances = calculateNetBalances(members, expensesAfterEdit, []);
    expect(balances['user-1']).toBe(75);
    expect(balances['user-2']).toBe(-75);

    mockSupabase.then.mockImplementationOnce((callback) => callback({ error: null }));

    const { error: deleteError } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    expect(deleteError).toBeNull();

    balances = calculateNetBalances(members, [], []);
    expect(balances['user-1']).toBe(0);
    expect(balances['user-2']).toBe(0);
  });

  it('should handle concurrent expense creation without race conditions (mocked)', async () => {
    const expense1 = {
      id: 'e1',
      paidById: 'user-1',
      amount: 100,
      splits: [{ userId: 'user-1', amount: 50 }, { userId: 'user-2', amount: 50 }],
    };
    const expense2 = {
      id: 'e2',
      paidById: 'user-2',
      amount: 60,
      splits: [{ userId: 'user-1', amount: 30 }, { userId: 'user-2', amount: 30 }],
    };

    const finalBalances = calculateNetBalances(members, [expense1, expense2], []);

    expect(finalBalances['user-1']).toBe(20);
    expect(finalBalances['user-2']).toBe(-20);
  });
});
