import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockContract, mockWallet, mockProvider, mockSupabase } = vi.hoisted(() => ({
  mockContract: {
    anchorGroupCID: Object.assign(vi.fn(), {
      estimateGas: vi.fn().mockResolvedValue(100000n)
    }),
    verifyCID: vi.fn(),
    getAnchorHistory: vi.fn(),
  },
  mockWallet: {
    connect: vi.fn(),
  },
  mockProvider: {
    getNetwork: vi.fn().mockResolvedValue({ name: 'base-sepolia', chainId: 84532 }),
  },
  mockSupabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn().mockImplementation((callback) => callback({ data: null, error: null })),
  },
}));

vi.mock('@/supabase/admin', () => ({
  supabaseAdmin: mockSupabase,
}));

vi.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: vi.fn().mockImplementation(() => mockProvider),
    Wallet: vi.fn().mockImplementation(() => mockWallet),
    Contract: vi.fn().mockImplementation(() => mockContract),
  },
  JsonRpcProvider: vi.fn().mockImplementation(() => mockProvider),
  Wallet: vi.fn().mockImplementation(() => mockWallet),
  Contract: vi.fn().mockImplementation(() => mockContract),
}));

import { AnchoringService } from '@/services/anchoring';
import { GroupBundleService } from '@/services/bundle';

describe('Anchoring Contract Interactions (Forked Environment Mock)', () => {
  let anchoringService: AnchoringService;
  let mockBundleService: GroupBundleService;

  const groupId = '550e8400-e29b-41d4-a716-446655440000';
  const rootCid = 'bafy-root-cid';

  beforeEach(() => {
    vi.clearAllMocks();
    mockBundleService = {
      createBundle: vi.fn().mockResolvedValue(rootCid),
    } as any;
    
    process.env.NEXT_PUBLIC_CID_REGISTRY_ADDRESS = '0x1234567890123456789012345678901234567890';
    process.env.ANCHOR_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
    process.env.BASE_SEPOLIA_RPC_URL = 'https://sepolia.base.org';

    anchoringService = new AnchoringService(mockBundleService);
  });

  it('should anchor a group CID successfully with retry logic', async () => {
    const mockTx = {
      hash: '0x-tx-hash',
      wait: vi.fn().mockResolvedValue({ hash: '0x-tx-hash' }),
    };
    mockContract.anchorGroupCID.mockResolvedValue(mockTx);

    const receipt = await anchoringService.anchorWithRetry(groupId, rootCid, 10);

    expect(receipt.hash).toBe('0x-tx-hash');
    expect(mockContract.anchorGroupCID).toHaveBeenCalled();
    
    const numericGroupId = BigInt('0x' + groupId.replace(/-/g, ''));
    expect(mockContract.anchorGroupCID).toHaveBeenCalledWith(
      numericGroupId,
      rootCid,
      10n,
      expect.any(Object)
    );
  });

  it('should handle anchoring failure and retry', async () => {
    mockContract.anchorGroupCID
      .mockRejectedValueOnce(new Error('Gas too low'))
      .mockResolvedValueOnce({
        hash: '0x-success-hash',
        wait: vi.fn().mockResolvedValue({ hash: '0x-success-hash' }),
      });

    const receipt = await anchoringService.anchorWithRetry(groupId, rootCid, 10);

    expect(receipt.hash).toBe('0x-success-hash');
    expect(mockContract.anchorGroupCID).toHaveBeenCalledTimes(2);
  });

  it('should verify an existing anchor correctly', async () => {
    mockContract.verifyCID.mockResolvedValue(true);

    const isVerified = await anchoringService.verifyAnchor(groupId, rootCid);

    expect(isVerified).toBe(true);
    expect(mockContract.verifyCID).toHaveBeenCalledWith(
      BigInt('0x' + groupId.replace(/-/g, '')),
      rootCid
    );
  });

  it('should handle multiple anchors for the same group in history', async () => {
    const mockHistory = [
      { cid: 'cid-1', timestamp: 1600000000n, recordCount: 5n },
      { cid: 'cid-2', timestamp: 1600000010n, recordCount: 12n },
    ];
    mockContract.getAnchorHistory.mockResolvedValue(mockHistory);

    const history = await anchoringService.getAnchorHistory(groupId);

    expect(history.length).toBe(2);
    expect(history[0].cid).toBe('cid-1');
    expect(history[1].recordCount).toBe(12);
  });
});
