import { z } from 'zod';

export const CreateMediaSchema = z.object({
  cid: z.string().min(1, 'CID is required'),
  media_type: z.string().min(1, 'Media type is required'),
  title: z.string().optional(),
  expense_id: z.string().uuid().optional(),
});

export const MediaFilterSchema = z.object({
  limit: z.number().int().positive().default(20),
  cursor: z.string().optional(),
});
