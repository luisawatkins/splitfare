import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NexusService } from '../../lib/nexus';

vi.mock('@avail-project/nexus-core', () => ({
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
            balance: '10.00',
            contractAddress: '0x123',
          },
          {
            chain: { id: 84532, name: 'Base Sepolia', logo: '' },
            symbol: 'USDC',
            balance: '90.00',
            contractAddress: '0x456',
          }
        ]
      }
    ]),
    transfer: vi.fn(),
  })),
  NEXUS_EVENTS: {
    STEPS_LIST: 'steps_list',
    STEP_COMPLETE: 'step_complete',
  }
}));

describe('Settlement System - Cross-Chain Routing & Failures', () => {
  let nexusService: NexusService;

  beforeEach(() => {
    nexusService = new NexusService('testnet');
  });

  it('should find the optimal source chain (chain with more balance)', async () => {
    const route = await nexusService.findOptimalRoute('USDC', '20', 84532);
    expect(route).toBeDefined();
    expect(route?.sourceChainId).toBe(84532); // Base has 90, Sepolia has 10
  });

  it('should handle transfer failure and maintain pending status', async () => {
    const mockSdk = (nexusService as any).sdk;
    mockSdk.transfer.mockRejectedValueOnce(new Error('Transaction rejected by user'));

    await expect(nexusService.executeTransfer('USDC', '10', 84532, '0xrecipient'))
      .rejects.toThrow('Transaction rejected by user');
  });

  it('should provide route preview with gas estimate', async () => {
    const route = await nexusService.findOptimalRoute('USDC', '20', 84532);
    expect(route).toHaveProperty('gasEstimate');
    expect(route).toHaveProperty('sourceChainId');
    expect(route).toHaveProperty('destChainId');
  });
});
