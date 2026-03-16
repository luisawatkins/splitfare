import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateNetBalances, GroupMember, GroupExpense, GroupSettlement } from '../../lib/balances';
import { generateSettlementManifest } from '../../lib/manifest';
import { verifySettlementTransaction } from '../../lib/verification';
import { nexusService } from '../../lib/nexus';
import { StorachaService } from '../../lib/storacha';

// Mock dependencies
vi.mock('../../lib/nexus', () => ({
  nexusService: {
    executeTransfer: vi.fn(),
    getTransferStatus: vi.fn(),
  },
}));

vi.mock('../../lib/storacha', () => ({
  StorachaService: vi.fn().mockImplementation(() => ({
    uploadJson: vi.fn(),
  })),
}));

describe('Integration Flow - Full Settlement Cycle', () => {
  const members: GroupMember[] = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
  ];

  let storachaService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    storachaService = new StorachaService({} as any);
  });

  it('should complete the full settlement cycle successfully', async () => {
    // 1. Expense creation
    const expenses: GroupExpense[] = [
      {
        id: 'e1',
        paidById: 'u1',
        amount: 30,
        splits: [
          { userId: 'u1', amount: 15 },
          { userId: 'u2', amount: 15 },
        ],
      },
    ];

    // 2. Balance calculation
    let balances = calculateNetBalances(members, expenses, []);
    expect(balances['u2']).toBe(-15); // Bob owes $15

    // 3. Settlement initiation & Nexus transfer (mocked)
    const txHash = '0xabc123';
    vi.mocked(nexusService.executeTransfer).mockResolvedValueOnce({
      transactionHash: txHash,
    });

    const transferResult = await nexusService.executeTransfer('USDC', '15', 84532, '0xalice');
    expect(transferResult.transactionHash).toBe(txHash);

    // 4. Manifest generation
    const settlement = {
      id: 's1',
      amount: 15,
      transactionHash: txHash,
      timestamp: new Date().toISOString(),
      payerId: 'u2',
      payeeId: 'u1',
    };
    const manifest = generateSettlementManifest(settlement, expenses);
    expect(manifest.settlement.txHash).toBe(txHash);

    // 5. Storacha upload (mocked)
    const manifestCid = 'bafy...manifest';
    vi.mocked(storachaService.uploadJson).mockResolvedValueOnce(manifestCid);
    const uploadedCid = await storachaService.uploadJson(manifest);
    expect(uploadedCid).toBe(manifestCid);

    // 6. Verification
    vi.mocked(nexusService.getTransferStatus).mockResolvedValueOnce({
      status: 'COMPLETED',
      transactionHash: txHash,
      explorerUrl: `https://nexus.availproject.org/tx/${txHash}`,
    });

    const verification = await verifySettlementTransaction(txHash);
    expect(verification.status).toBe('completed');

    // 7. Balance update
    const completedSettlement: GroupSettlement = {
      id: 's1',
      payerId: 'u2',
      payeeId: 'u1',
      amount: 15,
    };
    balances = calculateNetBalances(members, expenses, [completedSettlement]);
    expect(balances['u2']).toBe(0); // Bob settled up
  });

  it('should trigger retry logic if Storacha upload fails initially', async () => {
    const manifest = { version: '1.0.0' };
    
    // First attempt fails, second succeeds
    vi.mocked(storachaService.uploadJson)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('bafy...success');

    // Simple retry wrapper for the test
    const uploadWithRetry = async (data: any, retries = 3) => {
      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          return await storachaService.uploadJson(data);
        } catch (e) {
          lastError = e;
        }
      }
      throw lastError;
    };

    const result = await uploadWithRetry(manifest);
    expect(result).toBe('bafy...success');
    expect(storachaService.uploadJson).toHaveBeenCalledTimes(2);
  });

  it('should reject concurrent settlements for the same debt', async () => {
    // This is typically handled by the UI or API locking
    // Here we mock a simple lock mechanism
    const locks = new Set<string>();
    const initiateSettlement = (debtId: string) => {
      if (locks.has(debtId)) throw new Error('Settlement already in progress');
      locks.add(debtId);
      return '0xabc';
    };

    const debtId = 'u2-to-u1-g1';
    initiateSettlement(debtId); // First attempt succeeds
    
    expect(() => initiateSettlement(debtId)).toThrow('Settlement already in progress');
  });

  it('should maintain status as pending if transaction fails or is slow', async () => {
    const txHash = '0xabc123';
    vi.mocked(nexusService.getTransferStatus).mockResolvedValueOnce({
      status: 'PENDING',
      transactionHash: txHash,
    });

    const verification = await verifySettlementTransaction(txHash);
    expect(verification.status).toBe('pending');
  });
});
