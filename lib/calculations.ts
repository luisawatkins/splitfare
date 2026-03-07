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
  const balances: Record<string, number> = {};

  members.forEach((m) => {
    const user = m.user;
    if (user?.id) balances[user.id] = 0;
  });

  expenses?.forEach((expense) => {
    const creatorId = expense.created_by;

    if (balances[creatorId] !== undefined) {
      balances[creatorId] += Number(expense.total_amount);
    }

    expense.splits?.forEach((split) => {
      if (balances[split.user_id] !== undefined) {
        balances[split.user_id] -= Number(split.amount_owed);
      }
    });
  });

  settlements?.forEach((settlement) => {
    if (balances[settlement.payer_id] !== undefined) {
      balances[settlement.payer_id] += Number(settlement.amount);
    }
    if (balances[settlement.payee_id] !== undefined) {
      balances[settlement.payee_id] -= Number(settlement.amount);
    }
  });

  return balances;
}
