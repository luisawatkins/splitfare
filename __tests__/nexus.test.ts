import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NexusService } from '../lib/nexus';

vi.mock('@avail-project/nexus-core', () => {
  return {
    NexusSDK: vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      getBalancesForBridge: vi.fn().mockResolvedValue([
        {
          symbol: 'USDC',
          balance: '100.00',
          breakdown: [
            {
              chain: { id: 11155111, name: 'Ethereum Sepolia', logo: '' },
              symbol: 'USDC',
              balance: '40.00',
              contractAddress: '0x123',
            },
            {
              chain: { id: 84532, name: 'Base Sepolia', logo: '' },
              symbol: 'USDC',
              balance: '60.00',
              contractAddress: '0x456',
            }
          ]
        }
      ]),
      transfer: vi.fn().mockResolvedValue({ transactionHash: '0xabc' }),
    })),
    NEXUS_EVENTS: {
      STEPS_LIST: 'steps_list',
      STEP_COMPLETE: 'step_complete',
    }
  };
});

describe('NexusService', () => {
  let service: NexusService;

  beforeEach(() => {
    service = new NexusService('testnet');
  });

  it('should aggregate USDC balances correctly', async () => {
    const balances = await service.getUSDCBalance();
    expect(balances).toBeDefined();
    expect(balances?.totalBalance).toBe('100.00');
    expect(balances?.breakdown).toHaveLength(2);
    expect(balances?.breakdown[0].chainId).toBe(11155111);
  });

  it('should find the optimal source chain based on balance', async () => {
    const route = await service.findOptimalRoute('USDC', '10', 11155111);
    expect(route).toBeDefined();
    expect(route?.sourceChainId).toBe(84532); // Base has more balance (60 vs 40)
  });

  it('should execute transfer with correct BigInt conversion', async () => {
    const mockProvider = {};
    await service.initialize(mockProvider);
    
    const result = await service.executeTransfer('USDC', '10.5', 11155111, '0xrecipient');
    expect(result).toBeDefined();
    // 10.5 * 1e6 = 10500000
  });
});
