import { describe, it, expect, vi } from 'vitest';
import { generateSettlementManifest, validateManifestStructure } from '../../lib/manifest';

describe('Settlement System - Manifest Generation & Validation', () => {
  const mockSettlement = {
    id: 's1',
    groupId: 'g1',
    payerId: 'u1',
    payeeId: 'u2',
    amount: 20,
    transactionHash: '0xabc123',
    timestamp: new Date().toISOString(),
  };

  const mockExpenses = [
    { id: 'e1', receiptCid: 'cid123' },
    { id: 'e2', receiptCid: 'cid456' },
  ];

  it('should generate a structured manifest with all required fields', () => {
    const manifest = generateSettlementManifest(mockSettlement, mockExpenses);

    expect(manifest).toHaveProperty('version', '1.0.0');
    expect(manifest.settlement.id).toBe('s1');
    expect(manifest.settlement.amount).toBe(20);
    expect(manifest.settlement.txHash).toBe('0xabc123');
    expect(manifest.payer.id).toBe('u1');
    expect(manifest.payee.id).toBe('u2');
    expect(manifest.expenses).toHaveLength(2);
    expect(manifest.expenses[0].id).toBe('e1');
    expect(manifest.expenses[0].receiptCid).toBe('cid123');
  });

  it('should validate the manifest JSON structure', () => {
    const manifest = generateSettlementManifest(mockSettlement, mockExpenses);
    const isValid = validateManifestStructure(manifest);
    expect(isValid).toBe(true);
  });

  it('should fail validation if required fields are missing', () => {
    const invalidManifest = {
      version: '1.0.0',
      settlement: {
        id: 's1',
        // amount is missing
      },
    };
    const isValid = validateManifestStructure(invalidManifest as any);
    expect(isValid).toBe(false);
  });
});
