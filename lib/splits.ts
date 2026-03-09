import { SplitType } from "./validations/expense";

export interface SplitResult {
  userId: string;
  amount: number;
}

export const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const calculateEqualSplit = (
  totalAmount: number,
  userIds: string[]
): SplitResult[] => {
  if (userIds.length === 0) return [];
  
  const amountPerPerson = Math.floor((totalAmount / userIds.length) * 100) / 100;
  const totalDistributed = amountPerPerson * userIds.length;
  let remainderCents = Math.round((totalAmount - totalDistributed) * 100);

  return userIds.map((userId, index) => {
    let amount = amountPerPerson;
    if (remainderCents > 0) {
      amount += 0.01;
      remainderCents--;
    }
    return { userId, amount: roundToTwo(amount) };
  });
};

export const validateExactSplit = (
  totalAmount: number,
  splits: { userId: string; amount: number }[]
): boolean => {
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  return Math.abs(sum - totalAmount) < 0.001;
};

export const calculatePercentageSplit = (
  totalAmount: number,
  splits: { userId: string; percentage: number }[]
): SplitResult[] => {
  const totalPercentage = splits.reduce((acc, s) => acc + s.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.001) {
    throw new Error("Percentages must sum to 100%");
  }

  const results = splits.map((s) => ({
    userId: s.userId,
    amount: Math.floor(totalAmount * (s.percentage / 100) * 100) / 100,
  }));

  const distributed = results.reduce((acc, r) => acc + r.amount, 0);
  let remainderCents = Math.round((totalAmount - distributed) * 100);

  return results.map((r, index) => {
    if (remainderCents > 0 && splits[index].percentage > 0) {
      r.amount += 0.01;
      remainderCents--;
    }
    return { userId: r.userId, amount: roundToTwo(r.amount) };
  });
};

export const calculateSharesSplit = (
  totalAmount: number,
  splits: { userId: string; shares: number }[]
): SplitResult[] => {
  const totalShares = splits.reduce((acc, s) => acc + s.shares, 0);
  if (totalShares === 0) return [];

  const results = splits.map((s) => ({
    userId: s.userId,
    amount: Math.floor((totalAmount * (s.shares / totalShares)) * 100) / 100,
  }));

  const distributed = results.reduce((acc, r) => acc + r.amount, 0);
  let remainderCents = Math.round((totalAmount - distributed) * 100);

  return results.map((r, index) => {
    if (remainderCents > 0 && splits[index].shares > 0) {
      r.amount += 0.01;
      remainderCents--;
    }
    return { userId: r.userId, amount: roundToTwo(r.amount) };
  });
};
