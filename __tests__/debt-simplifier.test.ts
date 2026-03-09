import { describe, it, expect } from "vitest";
import { simplifyDebts } from "../lib/debt-simplifier";

describe("Debt Simplifier", () => {
  it("should simplify debts for 3 people", () => {
    // A owes B 10, B owes C 10
    // Simplified: A owes C 10
    const balances = {
      "u1": -10, // Debtor
      "u2": 0,   // Middleman
      "u3": 10,  // Creditor
    };

    const result = simplifyDebts(balances);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ from: "u1", to: "u3", amount: 10 });
  });

  it("should simplify complex debts", () => {
    // Alice owes 20, Bob owes 10, Charlie is owed 30
    const balances = {
      "u1": -20,
      "u2": -10,
      "u3": 30,
    };

    const result = simplifyDebts(balances);
    expect(result).toHaveLength(2);
    expect(result.find(r => r.from === "u1")).toEqual({ from: "u1", to: "u3", amount: 20 });
    expect(result.find(r => r.from === "u2")).toEqual({ from: "u2", to: "u3", amount: 10 });
  });

  it("should handle multi-person settlement", () => {
    // Alice owes 100, Bob is owed 60, Charlie is owed 40
    const balances = {
      "u1": -100,
      "u2": 60,
      "u3": 40,
    };

    const result = simplifyDebts(balances);
    expect(result).toHaveLength(2);
    expect(result.find(r => r.to === "u2")).toEqual({ from: "u1", to: "u2", amount: 60 });
    expect(result.find(r => r.to === "u3")).toEqual({ from: "u1", to: "u3", amount: 40 });
  });

  it("should return empty array for 0 balances", () => {
    const balances = {
      "u1": 0,
      "u2": 0,
    };

    const result = simplifyDebts(balances);
    expect(result).toEqual([]);
  });

  it("should handle precision issues", () => {
    const balances = {
      "u1": -0.000001,
      "u2": 0.000001,
    };

    const result = simplifyDebts(balances);
    expect(result).toEqual([]);
  });
});
