import { z } from "zod";

export const splitTypeSchema = z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]);

export const expenseMemberSchema = z.object({
  userId: z.string(),
  amount: z.number().optional(),
  percentage: z.number().optional(),
  shares: z.number().optional(),
  involved: z.boolean().default(true),
});

export const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.date().default(() => new Date()),
  category: z.string().min(1, "Category is required"),
  paidById: z.string().min(1, "Who paid is required"),
  splitType: splitTypeSchema.default("EQUAL"),
  members: z.array(expenseMemberSchema).min(1, "At least one member must be involved"),
  receiptUrl: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
export type SplitType = z.infer<typeof splitTypeSchema>;
export type ExpenseMember = z.infer<typeof expenseMemberSchema>;

export const CATEGORIES = [
  { id: "general", name: "General", icon: "Tag" },
  { id: "food", name: "Food & Drinks", icon: "Utensils" },
  { id: "transport", name: "Transport", icon: "Car" },
  { id: "housing", name: "Housing", icon: "Home" },
  { id: "entertainment", name: "Entertainment", icon: "Music" },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag" },
  { id: "utilities", name: "Utilities", icon: "Zap" },
  { id: "travel", name: "Travel", icon: "Plane" },
];
