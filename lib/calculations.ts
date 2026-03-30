import { calculateNetBalances, GroupMember, GroupExpense, GroupSettlement } from './balances';

/**
 * DB-shaped interfaces for balance computation.
 * This is a thin adapter over `calculateNetBalances` (from balances.ts)
 * to avoid duplicate logic. It converts DB column names (created_by, user_id, etc.)
 * to the canonical interface used by the core calculation.
 */

export interface Member {
  user: {
    id: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface Expense {
  created_by: string;
  total_amount: number | string;
  splits: Array<{
    user_id: string;
    amount_owed: number | string;
  }>;
}

export interface Settlement {
  payer_id: string;
  payee_id: string;
  amount: number | string;
}

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const canonicalMembers: GroupMember[] = members
    .filter(m => m.user?.id)
    .map(m => ({ id: m.user.id, name: m.user.name ?? '' }));

  const canonicalExpenses: GroupExpense[] = (expenses ?? []).map(e => ({
    id: '',
    paidById: e.created_by,
    amount: Number(e.total_amount),
    splits: (e.splits ?? []).map(s => ({
      userId: s.user_id,
      amount: Number(s.amount_owed),
    })),
  }));

  const canonicalSettlements: GroupSettlement[] = (settlements ?? []).map(s => ({
    id: '',
    payerId: s.payer_id,
    payeeId: s.payee_id,
    amount: Number(s.amount),
  }));

  return calculateNetBalances(canonicalMembers, canonicalExpenses, canonicalSettlements);
}
