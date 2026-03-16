import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(2),
  username: z.string().min(3),
  ens_name: z.string().optional().nullable(),
  wallet_address: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateUserSchema = UserSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const GroupCategoryEnum = z.enum([
  'trip',
  'household',
  'event',
  'project',
  'other',
]);

export const GroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional().nullable(),
  category: GroupCategoryEnum.default('other'),
  invite_code: z.string().min(8).max(8).optional(),
  space_did: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  currency: z.string().default('USDC'),
  created_by: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateGroupSchema = GroupSchema.omit({
  id: true,
  created_by: true,
  invite_code: true,
  space_did: true,
  created_at: true,
  updated_at: true,
});

export const ExpenseCategoryEnum = z.enum([
  'travel',
  'food',
  'accommodation',
  'transport',
  'subscription',
  'other',
]);

export const SplitTypeEnum = z.enum(['equal', 'percentage', 'shares', 'custom']);

export const ExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  group_id: z.string().uuid(),
  paid_by: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(1),
  category: ExpenseCategoryEnum.default('other'),
  split_type: SplitTypeEnum.default('equal'),
  date: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateExpenseSchema = ExpenseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  splits: z.array(z.object({
    user_id: z.string().uuid(),
    amount: z.number().nonnegative(),
    share: z.number().optional(),
  })).min(1),
});

export const SettlementStatusEnum = z.enum(['pending', 'completed', 'failed']);

export const SettlementSchema = z.object({
  id: z.string().uuid().optional(),
  group_id: z.string().uuid(),
  from_user_id: z.string().uuid(),
  to_user_id: z.string().uuid(),
  amount: z.number().positive(),
  status: SettlementStatusEnum.default('pending'),
  transaction_hash: z.string().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateSettlementSchema = SettlementSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
});

export const NotificationTypeEnum = z.enum([
  'expense_added',
  'settlement_sent',
  'settlement_received',
  'payment_reminder',
  'group_invite',
  'member_joined',
]);

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  type: NotificationTypeEnum,
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()),
  is_read: z.boolean(),
  created_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type CreateGroup = z.infer<typeof CreateGroupSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type CreateExpense = z.infer<typeof CreateExpenseSchema>;
export type Settlement = z.infer<typeof SettlementSchema>;
export type CreateSettlement = z.infer<typeof CreateSettlementSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
