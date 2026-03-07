import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSubdomain, checkAvailability } from '../lib/ens';

vi.mock('@thenamespace/offchain-manager', () => ({
  createOffchainClient: vi.fn(() => ({
    setApiKey: vi.fn(),
    isSubnameAvailable: vi.fn(),
  })),
}));

vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({
    getEnsAddress: vi.fn(),
    getEnsName: vi.fn(),
  })),
  http: vi.fn(),
}));

import { namespaceClient, publicClient } from '../lib/ens';

describe('validateSubdomain', () => {
  it('should validate valid subdomains', () => {
    expect(validateSubdomain('alice')).toEqual({ valid: true });
    expect(validateSubdomain('bob123')).toEqual({ valid: true });
  });

  it('should fail for too short subdomains', () => {
    expect(validateSubdomain('ab')).toEqual({ valid: false, error: 'Too short (min 3 chars)' });
  });

  it('should fail for too long subdomains', () => {
    expect(validateSubdomain('a'.repeat(21))).toEqual({ valid: false, error: 'Too long (max 20 chars)' });
  });

  it('should fail for non-alphanumeric characters', () => {
    expect(validateSubdomain('alice-bob')).toEqual({ valid: false, error: 'Alphanumeric only' });
    expect(validateSubdomain('alice.bob')).toEqual({ valid: false, error: 'Alphanumeric only' });
    expect(validateSubdomain('alice_bob')).toEqual({ valid: false, error: 'Alphanumeric only' });
  });
});

describe('checkAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false for invalid length', async () => {
    expect(await checkAvailability('ab')).toBe(false);
    expect(await checkAvailability('a'.repeat(21))).toBe(false);
  });

  it('should return false for invalid characters', async () => {
    expect(await checkAvailability('alice-bob')).toBe(false);
  });

  it('should return true if available via namespaceClient', async () => {
    vi.mocked(namespaceClient.isSubnameAvailable).mockResolvedValue({ isAvailable: true } as any);
    
    const result = await checkAvailability('alice');
    expect(result).toBe(true);
    expect(namespaceClient.isSubnameAvailable).toHaveBeenCalledWith('alice.splitfare.eth');
  });

  it('should return false if not available via namespaceClient', async () => {
    vi.mocked(namespaceClient.isSubnameAvailable).mockResolvedValue({ isAvailable: false } as any);
    
    const result = await checkAvailability('alice');
    expect(result).toBe(false);
  });

  it('should fallback to publicClient if namespaceClient fails', async () => {
    vi.mocked(namespaceClient.isSubnameAvailable).mockRejectedValue(new Error('API Error'));
    vi.mocked(publicClient.getEnsAddress).mockResolvedValue(null); // null means available

    const result = await checkAvailability('alice');
    expect(result).toBe(true);
    expect(publicClient.getEnsAddress).toHaveBeenCalled();
  });

  it('should return false if publicClient finds an address', async () => {
    vi.mocked(namespaceClient.isSubnameAvailable).mockRejectedValue(new Error('API Error'));
    vi.mocked(publicClient.getEnsAddress).mockResolvedValue('0x123' as `0x${string}`);

    const result = await checkAvailability('alice');
    expect(result).toBe(false);
  });
});
