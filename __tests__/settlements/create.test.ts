import { describe, it, expect } from 'vitest';
import { calculateNetBalances, GroupMember, GroupExpense, GroupSettlement } from '../../lib/balances';

describe('Settlement System - Creation & Balance Calculation', () => {
  const members: GroupMember[] = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
  ];

  it('should calculate balances correctly after expense creation', () => {
    const expenses: GroupExpense[] = [
      {
        id: 'e1',
        paidById: 'u1',
        amount: 30,
        splits: [
          { userId: 'u1', amount: 10 },
          { userId: 'u2', amount: 10 },
          { userId: 'u3', amount: 10 },
        ],
      },
    ];

    const balances = calculateNetBalances(members, expenses, []);
    expect(balances['u1']).toBe(20);
    expect(balances['u2']).toBe(-10);
    expect(balances['u3']).toBe(-10);
  });

  it('should handle partial settlements correctly', () => {
    const expenses: GroupExpense[] = [
      {
        id: 'e1',
        paidById: 'u1',
        amount: 45,
        splits: [
          { userId: 'u1', amount: 15 },
          { userId: 'u2', amount: 15 },
          { userId: 'u3', amount: 15 },
        ],
      },
    ];

    // Bob owes $15, pays $5 (partial settlement)
    const settlements: GroupSettlement[] = [
      { id: 's1', payerId: 'u2', payeeId: 'u1', amount: 5 },
    ];

    const balances = calculateNetBalances(members, expenses, settlements);
    expect(balances['u1']).toBe(25); // 30 (initial owed) - 5 (received) = 25
    expect(balances['u2']).toBe(-10); // -15 (initial owed) + 5 (paid) = -10
    expect(balances['u3']).toBe(-15);
  });

  it('should handle multiple settlements for a single debt', () => {
    const expenses: GroupExpense[] = [
      {
        id: 'e1',
        paidById: 'u1',
        amount: 30,
        splits: [
          { userId: 'u1', amount: 10 },
          { userId: 'u2', amount: 20 },
        ],
      },
    ];

    // Bob owes $20, pays in two installments
    const settlements: GroupSettlement[] = [
      { id: 's1', payerId: 'u2', payeeId: 'u1', amount: 12 },
      { id: 's2', payerId: 'u2', payeeId: 'u1', amount: 8 },
    ];

    const balances = calculateNetBalances(members, expenses, settlements);
    expect(balances['u1']).toBe(0);
    expect(balances['u2']).toBe(0);
  });

  it('should handle bidirectional debts (A owes B, B owes A)', () => {
    const expenses: GroupExpense[] = [
      {
        id: 'e1',
        paidById: 'u1',
        amount: 20,
        splits: [
          { userId: 'u1', amount: 10 },
          { userId: 'u2', amount: 10 },
        ],
      },
      {
        id: 'e2',
        paidById: 'u2',
        amount: 30,
        splits: [
          { userId: 'u1', amount: 15 },
          { userId: 'u2', amount: 15 },
        ],
      },
    ];

    // u1 owes u2 $15, u2 owes u1 $10. Net: u1 owes u2 $5.
    const balances = calculateNetBalances(members, expenses, []);
    expect(balances['u1']).toBe(-5);
    expect(balances['u2']).toBe(5);

    // u1 settles the net debt
    const settlements: GroupSettlement[] = [
      { id: 's1', payerId: 'u1', payeeId: 'u2', amount: 5 },
    ];

    const finalBalances = calculateNetBalances(members, expenses, settlements);
    expect(finalBalances['u1']).toBe(0);
    expect(finalBalances['u2']).toBe(0);
  });
});
