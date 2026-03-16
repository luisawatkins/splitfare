import { z } from 'zod';

export const SettlementManifestSchema = z.object({
  version: z.string().default('1.0.0'),
  settlement: z.object({
    id: z.string().uuid().or(z.string()),
    amount: z.number().positive(),
    txHash: z.string(),
    timestamp: z.string().datetime().or(z.string()),
  }),
  payer: z.object({
    id: z.string().uuid().or(z.string()),
  }),
  payee: z.object({
    id: z.string().uuid().or(z.string()),
  }),
  expenses: z.array(z.object({
    id: z.string().uuid().or(z.string()),
    receiptCid: z.string().optional().nullable(),
  })),
});

export type SettlementManifest = z.infer<typeof SettlementManifestSchema>;

export function generateSettlementManifest(
  settlement: {
    id: string;
    amount: number;
    transactionHash: string;
    timestamp: string;
    payerId: string;
    payeeId: string;
  },
  expenses: Array<{
    id: string;
    receiptCid?: string | null;
  }>
): SettlementManifest {
  return {
    version: '1.0.0',
    settlement: {
      id: settlement.id,
      amount: settlement.amount,
      txHash: settlement.transactionHash,
      timestamp: settlement.timestamp,
    },
    payer: {
      id: settlement.payerId,
    },
    payee: {
      id: settlement.payeeId,
    },
    expenses: expenses.map((e) => ({
      id: e.id,
      receiptCid: e.receiptCid,
    })),
  };
}

export function validateManifestStructure(manifest: any): boolean {
  try {
    SettlementManifestSchema.parse(manifest);
    return true;
  } catch (e) {
    console.error('Manifest validation failed:', e);
    return false;
  }
}
