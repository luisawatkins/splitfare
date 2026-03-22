import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSupabase, mockStoracha, mockContract, mockWallet, mockProvider } = vi.hoisted(() => ({
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
  mockStoracha: {
    uploadFile: vi.fn().mockResolvedValue('bafy-receipt-cid'),
    uploadJson: vi.fn().mockResolvedValue('bafy-manifest-cid'),
    uploadCar: vi.fn().mockResolvedValue('bafy-car-cid'),
    createSpace: vi.fn().mockResolvedValue({ did: () => 'did:key:zSpace' }),
    createDelegation: vi.fn().mockResolvedValue({ cid: { toString: () => 'bafy-ucan-cid' } }),
  },
  mockContract: {
    anchorGroupCID: Object.assign(vi.fn().mockResolvedValue({ hash: '0x-anchor-tx', wait: vi.fn().mockResolvedValue({ hash: '0x-anchor-tx' }) }), {
      estimateGas: vi.fn().mockResolvedValue(100000n)
    }),
    verifyCID: vi.fn().mockResolvedValue(true),
  },
  mockWallet: {},
  mockProvider: {},
}));

vi.mock('@/supabase/admin', () => ({ supabaseAdmin: mockSupabase }));
vi.mock('@/lib/storacha-server', () => ({ createServerStorachaService: vi.fn().mockResolvedValue(mockStoracha) }));
vi.mock('@/lib/car-builder', () => ({ createBundleCar: vi.fn().mockResolvedValue({ rootCid: 'bafy-bundle-root', carBuffer: new Uint8Array([1, 2, 3]) }) }));
vi.mock('ethers', () => ({
  ethers: { JsonRpcProvider: vi.fn().mockImplementation(() => mockProvider), Wallet: vi.fn().mockImplementation(() => mockWallet), Contract: vi.fn().mockImplementation(() => mockContract) },
  JsonRpcProvider: vi.fn().mockImplementation(() => mockProvider),
  Wallet: vi.fn().mockImplementation(() => mockWallet),
  Contract: vi.fn().mockImplementation(() => mockContract),
}));

import { UCANService } from '@/services/ucan';
import { GroupBundleService } from '@/services/bundle';
import { AnchoringService } from '@/services/anchoring';
import { ExporterService } from '@/services/exporter';

describe('SplitFare Full Lifecycle Integration Test', () => {
  const userId = 'user-owner';
  const groupId = '550e8400-e29b-41d4-a716-446655440000';
  const spaceDid = 'did:key:zSpace';
  const validCid = 'bafybeigdyrztxw3r5v7rrf5f2lqf3e7l7xootm5qdn7x6zq7j5l3z5d2uy';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANCHOR_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
    process.env.NEXT_PUBLIC_CID_REGISTRY_ADDRESS = '0x1234567890123456789012345678901234567890';
    process.env.BASE_SEPOLIA_RPC_URL = 'https://sepolia.base.org';
  });

  it('should complete the full lifecycle from group creation to verification and export', async () => {
    const ucanService = new UCANService(mockStoracha as any);
    const ownerProof = await ucanService.delegateAccess(spaceDid, `did:pkh:eip155:1:0xowner`, 'owner');
    expect(ownerProof.cid).toBe('bafy-ucan-cid');
    expect(ownerProof.abilities).toContain('*');

    const memberProof = await ucanService.delegateAccess(spaceDid, `did:pkh:eip155:1:0xmember`, 'member');
    expect(memberProof.abilities).toContain('space/blob/add');


    const receiptCid = await mockStoracha.uploadFile(new Blob(['receipt-data']));
    expect(receiptCid).toBe('bafy-receipt-cid');
    const realReceiptCid = validCid;


    const manifestCid = await mockStoracha.uploadJson({ payer: 'user-member', payee: 'user-owner', amount: 50 });
    expect(manifestCid).toBe('bafy-manifest-cid');
    const realManifestCid = validCid;


    mockSupabase.single.mockResolvedValueOnce({ data: { name: 'Lifecycle Trip' }, error: null });
    mockSupabase.then
      .mockImplementationOnce((cb) => cb({ data: [{ users: { id: userId, name: 'Alice', wallet_address: '0xowner' } }], error: null })) 
      .mockImplementationOnce((cb) => cb({ data: [{ id: 'exp-1', total_amount: 100, currency: 'USDC', created_at: new Date().toISOString(), splits: [], media: [{ cid: realReceiptCid }] }], error: null })) 
      .mockImplementationOnce((cb) => cb({ data: [{ id: 'set-1', amount: 50, currency: 'USDC', manifest_cid: realManifestCid }], error: null })) 
      .mockImplementationOnce((cb) => cb({ data: [], error: null })); 

    const bundleService = new GroupBundleService(mockStoracha as any);
    const bundleRootCid = await bundleService.createBundle(groupId);
    expect(bundleRootCid).toBe('bafy-bundle-root');
    expect(mockStoracha.uploadCar).toHaveBeenCalled();

    const anchoringService = new AnchoringService(bundleService);
    mockSupabase.then
      .mockImplementationOnce((cb) => cb({ count: 1, error: null })) 
      .mockImplementationOnce((cb) => cb({ count: 1, error: null })); 
    
    const anchorReceipt = await anchoringService.anchorWithRetry(groupId, bundleRootCid, 2);
    expect(anchorReceipt.hash).toBe('0x-anchor-tx');

    const isVerified = await anchoringService.verifyAnchor(groupId, bundleRootCid);
    expect(isVerified).toBe(true);

    const exporter = new ExporterService(mockStoracha as any);
    mockSupabase.single.mockResolvedValue({ data: { name: 'Lifecycle Trip' }, error: null });
    mockSupabase.then
      .mockImplementationOnce((cb) => cb({ data: [], error: null })) 
      .mockImplementationOnce((cb) => cb({ data: [], error: null })) 
      .mockImplementationOnce((cb) => cb({ data: [], error: null })); 

    const jsonDataStr = await exporter.exportToJson(groupId);
    const jsonData = JSON.parse(jsonDataStr);
    expect(jsonData.group.name).toBe('Lifecycle Trip');
  });
});
