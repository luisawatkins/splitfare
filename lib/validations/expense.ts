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
  receiptCid: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
export type SplitType = z.infer<typeof splitTypeSchema>;
export type ExpenseMember = z.infer<typeof expenseMemberSchema>;

export const CreateExpenseApiSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().datetime().optional().default(() => new Date().toISOString()),
  category: z.string().min(1, "Category is required"),
  paidById: z.string().uuid("Invalid user ID for paidById"),
  splitType: splitTypeSchema,
  splits: z.array(z.object({
    userId: z.string().uuid("Invalid user ID in splits"),
    amount: z.number().nonnegative(),
    percentage: z.number().optional(),
    shares: z.number().int().optional(),
  })).min(1, "At least one split is required"),
  receiptCid: z.string().optional().nullable(),
});

export const UpdateExpenseApiSchema = CreateExpenseApiSchema.partial();

export const ExpenseFilterSchema = z.object({
  category: z.string().optional(),
  paidBy: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().datetime().optional(),
});

export type CreateExpenseApi = z.infer<typeof CreateExpenseApiSchema>;
export type UpdateExpenseApi = z.infer<typeof UpdateExpenseApiSchema>;
export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;

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
