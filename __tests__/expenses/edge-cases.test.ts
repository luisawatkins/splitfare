import { describe, it, expect } from "vitest";
import { calculateEqualSplit, calculatePercentageSplit, calculateSharesSplit } from "@/lib/splits";

describe("Expense Edge Cases", () => {
  const u1 = "user-1";
  const u2 = "user-2";

  it("should handle single member expenses correctly", () => {
    const amount = 100;
    const result = calculateEqualSplit(amount, [u1]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ userId: u1, amount: 100 });
  });

  it("should handle very large amounts ($999,999,999.99)", () => {
    const amount = 999999999.99;
    const result = calculateEqualSplit(amount, [u1, u2]);
    // 999999999.99 / 2 = 499999999.995 -> 499999999.99 and 500000000.00
    expect(result[0].amount).toBe(500000000.00);
    expect(result[1].amount).toBe(499999999.99);
    expect(result[0].amount + result[1].amount).toBe(amount);
  });

  it("should handle very small amounts ($0.01)", () => {
    const amount = 0.01;
    const result = calculateEqualSplit(amount, [u1, u2]);
    expect(result[0].amount).toBe(0.01);
    expect(result[1].amount).toBe(0.00);
    expect(result[0].amount + result[1].amount).toBe(amount);
  });

  it("should handle zero amount expenses", () => {
    const amount = 0;
    const result = calculateEqualSplit(amount, [u1, u2]);
    expect(result[0].amount).toBe(0);
    expect(result[1].amount).toBe(0);
  });

  it("should handle percentage splits with tiny amounts", () => {
    const amount = 0.01;
    const splits = [
      { userId: u1, percentage: 50 },
      { userId: u2, percentage: 50 },
    ];
    const result = calculatePercentageSplit(amount, splits);
    expect(result[0].amount).toBe(0.01);
    expect(result[1].amount).toBe(0.00);
  });

  it("should handle share splits with one member having 0 shares", () => {
    const amount = 100;
    const splits = [
      { userId: u1, shares: 1 },
      { userId: u2, shares: 0 },
    ];
    const result = calculateSharesSplit(amount, splits);
    expect(result[0].amount).toBe(100);
    expect(result[1].amount).toBe(0);
  });
});
