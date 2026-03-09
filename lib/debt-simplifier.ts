import { roundToTwo } from "./splits";

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export const simplifyDebts = (balances: Record<string, number>): Transaction[] => {
  const transactions: Transaction[] = [];

  let debtors = Object.entries(balances)
    .filter(([_, balance]) => balance < -0.001)
    .map(([userId, balance]) => ({ userId, balance: Math.abs(balance) }))
    .sort((a, b) => b.balance - a.balance);

  let creditors = Object.entries(balances)
    .filter(([_, balance]) => balance > 0.001)
    .map(([userId, balance]) => ({ userId, balance }))
    .sort((a, b) => b.balance - a.balance);

  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const settlementAmount = Math.min(debtor.balance, creditor.balance);
    
    if (settlementAmount > 0) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: roundToTwo(settlementAmount),
      });

      debtor.balance = roundToTwo(debtor.balance - settlementAmount);
      creditor.balance = roundToTwo(creditor.balance - settlementAmount);
    }

    if (debtor.balance < 0.001) {
      debtorIdx++;
    }
    if (creditor.balance < 0.001) {
      creditorIdx++;
    }
  }

  return transactions;
};
