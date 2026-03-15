import { describe, it, expect } from "vitest";
import { calculateNetBalances } from "../lib/balances";

describe("Balance Calculator", () => {
  const members = [
    { id: "u1", name: "Alice" },
    { id: "u2", name: "Bob" },
    { id: "u3", name: "Charlie" },
  ];

  it("should calculate balance correctly with expenses", () => {
    const expenses = [
      {
        id: "e1",
        paidById: "u1",
        amount: 30,
        splits: [
          { userId: "u1", amount: 10 },
          { userId: "u2", amount: 10 },
          { userId: "u3", amount: 10 },
        ],
      },
    ];

    const result = calculateNetBalances(members, expenses, []);
    expect(result["u1"]).toBe(20); // Paid 30, owed 10 = +20
    expect(result["u2"]).toBe(-10); // Owed 10 = -10
    expect(result["u3"]).toBe(-10); // Owed 10 = -10
  });

  it("should calculate balance correctly with settlements", () => {
    const expenses = [
      {
        id: "e1",
        paidById: "u1",
        amount: 30,
        splits: [
          { userId: "u1", amount: 10 },
          { userId: "u2", amount: 10 },
          { userId: "u3", amount: 10 },
        ],
      },
    ];

    const settlements = [
      { id: "s1", payerId: "u2", payeeId: "u1", amount: 10 },
    ];

    const result = calculateNetBalances(members, expenses, settlements);
    expect(result["u1"]).toBe(10); // Was 20, got paid 10 = +10
    expect(result["u2"]).toBe(0); // Was -10, paid 10 = 0
    expect(result["u3"]).toBe(-10); // Still -10
  });

  it("should handle rounding issues correctly", () => {
    const expenses = [
      {
        id: "e1",
        paidById: "u1",
        amount: 10,
        splits: [
          { userId: "u1", amount: 3.34 },
          { userId: "u2", amount: 3.33 },
          { userId: "u3", amount: 3.33 },
        ],
      },
    ];

    const result = calculateNetBalances(members, expenses, []);
    expect(result["u1"]).toBe(6.66); // 10 - 3.34 = 6.66
    expect(result["u2"]).toBe(-3.33); // 0 - 3.33 = -3.33
    expect(result["u3"]).toBe(-3.33); // 0 - 3.33 = -3.33
    
    // Sum of all balances should be 0
    const sum = Object.values(result).reduce((acc, b) => acc + b, 0);
    expect(Math.abs(sum)).toBeLessThan(0.001);
  });

  it("should calculate balance correctly with 10+ expense combinations", () => {
    const manyExpenses = Array.from({ length: 15 }, (_, i) => ({
      id: `e${i}`,
      paidById: members[i % 3].id,
      amount: 30,
      splits: [
        { userId: "u1", amount: 10 },
        { userId: "u2", amount: 10 },
        { userId: "u3", amount: 10 },
      ],
    }));

    const result = calculateNetBalances(members, manyExpenses, []);
    expect(result["u1"]).toBe(0);
    expect(result["u2"]).toBe(0);
    expect(result["u3"]).toBe(0);
  });
});
