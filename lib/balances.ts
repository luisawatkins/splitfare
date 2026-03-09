import { roundToTwo } from "./splits";

export interface GroupMember {
  id: string;
  name: string;
}

export interface GroupExpense {
  id: string;
  paidById: string;
  amount: number;
  splits: Array<{
    userId: string;
    amount: number;
  }>;
}

export interface GroupSettlement {
  id: string;
  payerId: string;
  payeeId: string;
  amount: number;
}

export const calculateNetBalances = (
  members: GroupMember[],
  expenses: GroupExpense[],
  settlements: GroupSettlement[]
): Record<string, number> => {
  const balances: Record<string, number> = {};

  members.forEach((member) => {
    balances[member.id] = 0;
  });

  expenses.forEach((expense) => {
    if (balances[expense.paidById] !== undefined) {
      balances[expense.paidById] += expense.amount;
    }

    expense.splits.forEach((split) => {
      if (balances[split.userId] !== undefined) {
        balances[split.userId] -= split.amount;
      }
    });
  });

  settlements.forEach((settlement) => {
    if (balances[settlement.payerId] !== undefined) {
      balances[settlement.payerId] += settlement.amount;
    }
    if (balances[settlement.payeeId] !== undefined) {
      balances[settlement.payeeId] -= settlement.amount;
    }
  });

  Object.keys(balances).forEach((userId) => {
    balances[userId] = roundToTwo(balances[userId]);
  });

  return balances;
};
