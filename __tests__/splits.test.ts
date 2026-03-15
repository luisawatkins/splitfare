import { describe, it, expect } from "vitest";
import { 
  calculateEqualSplit, 
  validateExactSplit, 
  calculatePercentageSplit, 
  calculateSharesSplit 
} from "../lib/splits";

describe("Split Algorithms", () => {
  describe("calculateEqualSplit", () => {
    it("should split 100 between 3 members with remainder handling", () => {
      const result = calculateEqualSplit(100, ["u1", "u2", "u3"]);
      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(33.34);
      expect(result[1].amount).toBe(33.33);
      expect(result[2].amount).toBe(33.33);
      expect(result.reduce((acc, r) => acc + r.amount, 0)).toBe(100);
    });

    it("should handle 0.01 split between 2 members", () => {
      const result = calculateEqualSplit(0.01, ["u1", "u2"]);
      expect(result[0].amount).toBe(0.01);
      expect(result[1].amount).toBe(0.00);
      expect(result.reduce((acc, r) => acc + r.amount, 0)).toBe(0.01);
    });

    it("should return empty array for 0 members", () => {
      const result = calculateEqualSplit(100, []);
      expect(result).toEqual([]);
    });
  });

  describe("validateExactSplit", () => {
    it("should return true if total equals expense amount", () => {
      const splits = [
        { userId: "u1", amount: 33.34 },
        { userId: "u2", amount: 66.66 },
      ];
      expect(validateExactSplit(100, splits)).toBe(true);
    });

    it("should return false if total does not equal expense amount", () => {
      const splits = [
        { userId: "u1", amount: 33.34 },
        { userId: "u2", amount: 66.65 },
      ];
      expect(validateExactSplit(100, splits)).toBe(false);
    });
  });

  describe("calculatePercentageSplit", () => {
    it("should calculate amounts based on percentages", () => {
      const splits = [
        { userId: "u1", percentage: 50 },
        { userId: "u2", percentage: 50 },
      ];
      const result = calculatePercentageSplit(100, splits);
      expect(result[0].amount).toBe(50);
      expect(result[1].amount).toBe(50);
    });

    it("should handle remainder with percentages", () => {
      const splits = [
        { userId: "u1", percentage: 33.33 },
        { userId: "u2", percentage: 33.33 },
        { userId: "u3", percentage: 33.34 },
      ];
      const result = calculatePercentageSplit(100, splits);
      expect(result.reduce((acc, r) => acc + r.amount, 0)).toBe(100);
    });

    it("should throw error if percentages do not sum to 100", () => {
      const splits = [{ userId: "u1", percentage: 90 }];
      expect(() => calculatePercentageSplit(100, splits)).toThrow("Percentages must sum to 100%");
    });
  });

  describe("calculateSharesSplit", () => {
    it("should split amounts by share count", () => {
      const splits = [
        { userId: "u1", shares: 1 },
        { userId: "u2", shares: 2 },
      ];
      const result = calculateSharesSplit(90, splits);
      expect(result[0].amount).toBe(30);
      expect(result[1].amount).toBe(60);
    });

    it("should handle remainder with shares", () => {
      const splits = [
        { userId: "u1", shares: 1 },
        { userId: "u2", shares: 1 },
        { userId: "u3", shares: 1 },
      ];
      const result = calculateSharesSplit(100, splits);
      expect(result[0].amount).toBe(33.34);
      expect(result[1].amount).toBe(33.33);
      expect(result[2].amount).toBe(33.33);
      expect(result.reduce((acc, r) => acc + r.amount, 0)).toBe(100);
    });
  });

  describe("Split Edge Cases & Rounding", () => {
    it("should handle $0.01 split between 2 members (equal)", () => {
      const result = calculateEqualSplit(0.01, ["u1", "u2"]);
      expect(result[0].amount).toBe(0.01);
      expect(result[1].amount).toBe(0.00);
      expect(result.reduce((acc, r) => acc + r.amount, 0)).toBe(0.01);
    });

    it("should handle $999,999.99 split between 3 members (equal)", () => {
      const result = calculateEqualSplit(999999.99, ["u1", "u2", "u3"]);
      expect(result[0].amount).toBe(333333.33);
      expect(result[1].amount).toBe(333333.33);
      expect(result[2].amount).toBe(333333.33);
      expect(result.reduce((acc, r) => acc + r.amount, 0)).toBe(999999.99);
    });

    it("should handle single member expense", () => {
      const result = calculateEqualSplit(100, ["u1"]);
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(100);
    });

    it("should handle very small amounts with percentages", () => {
      const splits = [
        { userId: "u1", percentage: 50 },
        { userId: "u2", percentage: 50 },
      ];
      const result = calculatePercentageSplit(0.01, splits);
      expect(result[0].amount).toBe(0.01);
      expect(result[1].amount).toBe(0.00);
      expect(result.reduce((acc, r) => acc + r.amount, 0)).toBe(0.01);
    });

    it("should handle very large amounts with shares", () => {
      const splits = [
        { userId: "u1", shares: 1 },
        { userId: "u2", shares: 1 },
      ];
      const result = calculateSharesSplit(10000000.01, splits);
      expect(result[0].amount).toBe(5000000.01);
      expect(result[1].amount).toBe(5000000.00);
      expect(result.reduce((acc, r) => acc + r.amount, 0)).toBe(10000000.01);
    });
  });
});
