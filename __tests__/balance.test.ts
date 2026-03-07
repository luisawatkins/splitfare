import { describe, it, expect } from 'vitest';
import { calculateBalances } from '../lib/calculations';

describe('calculateBalances', () => {
  const members = [
    { user: { id: 'user1', name: 'Alice' } },
    { user: { id: 'user2', name: 'Bob' } },
    { user: { id: 'user3', name: 'Charlie' } },
  ];

  it('should return zero balances when there are no expenses or settlements', () => {
    const balances = calculateBalances(members, [], []);
    expect(balances).toEqual({
      user1: 0,
      user2: 0,
      user3: 0,
    });
  });

  it('should calculate balances correctly with one expense split equally', () => {
    const expenses = [
      {
        created_by: 'user1',
        total_amount: 30,
        splits: [
          { user_id: 'user1', amount_owed: 10 },
          { user_id: 'user2', amount_owed: 10 },
          { user_id: 'user3', amount_owed: 10 },
        ],
      },
    ];
    const balances = calculateBalances(members, expenses, []);
    expect(balances).toEqual({
      user1: 20,
      user2: -10,
      user3: -10,
    });
  });

  it('should calculate balances correctly with multiple expenses', () => {
    const expenses = [
      {
        created_by: 'user1',
        total_amount: 30,
        splits: [
          { user_id: 'user1', amount_owed: 10 },
          { user_id: 'user2', amount_owed: 10 },
          { user_id: 'user3', amount_owed: 10 },
        ],
      },
      {
        created_by: 'user2',
        total_amount: 15,
        splits: [
          { user_id: 'user1', amount_owed: 5 },
          { user_id: 'user2', amount_owed: 5 },
          { user_id: 'user3', amount_owed: 5 },
        ],
      },
    ];
    const balances = calculateBalances(members, expenses, []);
    expect(balances).toEqual({
      user1: 15, // (30 - 10) - 5
      user2: 0,  // -10 + (15 - 5)
      user3: -15, // -10 - 5
    });
  });

  it('should account for settlements correctly', () => {
    const expenses = [
      {
        created_by: 'user1',
        total_amount: 30,
        splits: [
          { user_id: 'user1', amount_owed: 10 },
          { user_id: 'user2', amount_owed: 10 },
          { user_id: 'user3', amount_owed: 10 },
        ],
      },
    ];
    const settlements = [
      { payer_id: 'user2', payee_id: 'user1', amount: 10 },
    ];
    const balances = calculateBalances(members, expenses, settlements);
    expect(balances).toEqual({
      user1: 10, // 20 - 10 (received payment)
      user2: 0,  // -10 + 10 (made payment)
      user3: -10,
    });
  });

  it('should handle string amounts correctly', () => {
    const expenses = [
      {
        created_by: 'user1',
        total_amount: '30.50',
        splits: [
          { user_id: 'user1', amount_owed: '10.25' },
          { user_id: 'user2', amount_owed: '20.25' },
        ],
      },
    ];
    const balances = calculateBalances(members, expenses, []);
    expect(balances.user1).toBeCloseTo(20.25);
    expect(balances.user2).toBeCloseTo(-20.25);
  });
});
