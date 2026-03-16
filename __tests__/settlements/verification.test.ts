import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifySettlementTransaction } from '../../lib/verification';
import { nexusService } from '../../lib/nexus';

vi.mock('../../lib/nexus', () => ({
  nexusService: {
    getTransferStatus: vi.fn(),
  },
}));

describe('Settlement System - Transaction Verification', () => {
  const txHash = '0xabc123';

  it('should return "completed" status when transaction is successful', async () => {
    vi.mocked(nexusService.getTransferStatus).mockResolvedValueOnce({
      status: 'COMPLETED',
      transactionHash: txHash,
      explorerUrl: `https://nexus.availproject.org/tx/${txHash}`,
    });

    const result = await verifySettlementTransaction(txHash);
    expect(result.status).toBe('completed');
    expect(result.txHash).toBe(txHash);
  });

  it('should return "pending" status when transaction is still processing', async () => {
    vi.mocked(nexusService.getTransferStatus).mockResolvedValueOnce({
      status: 'PENDING',
      transactionHash: txHash,
      explorerUrl: `https://nexus.availproject.org/tx/${txHash}`,
    });

    const result = await verifySettlementTransaction(txHash);
    expect(result.status).toBe('pending');
  });

  it('should return "failed" status when transaction fails', async () => {
    vi.mocked(nexusService.getTransferStatus).mockResolvedValueOnce({
      status: 'FAILED',
      transactionHash: txHash,
      explorerUrl: `https://nexus.availproject.org/tx/${txHash}`,
    });

    const result = await verifySettlementTransaction(txHash);
    expect(result.status).toBe('failed');
  });

  it('should handle errors gracefully and keep status as "pending"', async () => {
    vi.mocked(nexusService.getTransferStatus).mockRejectedValueOnce(new Error('Network error'));

    const result = await verifySettlementTransaction(txHash);
    expect(result.status).toBe('pending');
  });
});
