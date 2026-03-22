import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn(),
    then: vi.fn().mockImplementation((callback) => callback({ data: null, error: null })),
  },
}));

vi.mock('@/supabase/admin', () => ({
  supabaseAdmin: mockSupabase,
}));

vi.mock('@/lib/car-builder', () => ({
  createBundleCar: vi.fn().mockResolvedValue({
    rootCid: { toString: () => 'bafy-root-cid' },
    carBuffer: new Uint8Array([1, 2, 3]),
  }),
}));

import { GroupBundleService } from '@/services/bundle';
import { StorachaService } from '@/lib/storacha';
import { createBundleCar } from '@/lib/car-builder';

describe('CAR Bundle Creation Scale Tests', () => {
  let bundleService: GroupBundleService;
  let mockStoracha: StorachaService;

  const groupId = 'group-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockStoracha = {
      uploadCar: vi.fn().mockResolvedValue('bafy-car-cid'),
    } as any;
    bundleService = new GroupBundleService(mockStoracha);
  });

  const setupMockData = (expenseCount: number) => {
    mockSupabase.single.mockResolvedValue({ data: { name: 'Scale Test Group' }, error: null });
    
    mockSupabase.then
      .mockImplementationOnce((cb) => cb({ data: [], error: null })) 
      .mockImplementationOnce((cb) => cb({ 
        data: Array.from({ length: expenseCount }, (_, i) => ({
          id: `exp-${i}`,
          description: `Expense ${i}`,
          total_amount: 10,
          currency: 'USDC',
          created_at: new Date().toISOString(),
          created_by: 'user-1',
          category: 'food',
          splits: [],
          media: []
        })), 
        error: null 
      })) // expenses
      .mockImplementationOnce((cb) => cb({ data: [], error: null })) 
      .mockImplementationOnce((cb) => cb({ data: [], error: null })); 
  };

  it('should handle bundle creation with 0 expenses', async () => {
    setupMockData(0);
    const rootCid = await bundleService.createBundle(groupId);
    expect(rootCid).toBe('bafy-root-cid');
    expect(createBundleCar).toHaveBeenCalledWith(expect.objectContaining({
      expenses: []
    }));
  });

  it('should handle bundle creation with 10 expenses', async () => {
    setupMockData(10);
    const rootCid = await bundleService.createBundle(groupId);
    expect(rootCid).toBe('bafy-root-cid');
    expect(createBundleCar).toHaveBeenCalled();
    const bundle = vi.mocked(createBundleCar).mock.calls[0][0];
    expect(bundle.expenses.length).toBe(10);
  });

  it('should handle bundle creation with 100+ expenses and complete quickly', async () => {
    const expenseCount = 150;
    setupMockData(expenseCount);
    
    const startTime = Date.now();
    const rootCid = await bundleService.createBundle(groupId);
    const duration = Date.now() - startTime;

    expect(rootCid).toBe('bafy-root-cid');
    const bundle = vi.mocked(createBundleCar).mock.calls[0][0];
    expect(bundle.expenses.length).toBe(expenseCount);

    expect(duration).toBeLessThan(30000);
    console.log(`Bundle creation for ${expenseCount} expenses took ${duration}ms`);
  });
});
