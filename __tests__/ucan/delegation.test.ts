import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UCANService, DelegationProof } from '@/services/ucan';
import { StorachaService } from '@/lib/storacha';

describe('UCAN Delegation Flow', () => {
  let ucanService: UCANService;
  let mockStoracha: StorachaService;

  const spaceDid = 'did:key:z6MkqBAn';
  const aliceDid = 'did:pkh:eip155:1:0xalice';
  const bobDid = 'did:pkh:eip155:1:0xbob';

  beforeEach(() => {
    mockStoracha = {
      createDelegation: vi.fn(),
    } as any;
    ucanService = new UCANService(mockStoracha);
  });

  it('should delegate owner access with full abilities', async () => {
    const mockDelegation = {
      cid: { toString: () => 'bafy-delegation-cid' },
    };
    (mockStoracha.createDelegation as any).mockResolvedValue(mockDelegation);

    const proof = await ucanService.delegateAccess(spaceDid, aliceDid, 'owner');

    expect(proof.cid).toBe('bafy-delegation-cid');
    expect(proof.abilities).toContain('*');
    expect(mockStoracha.createDelegation).toHaveBeenCalledWith(
      aliceDid,
      ['*'],
      expect.objectContaining({ resource: spaceDid })
    );
  });

  it('should delegate member access with restricted abilities', async () => {
    const mockDelegation = {
      cid: { toString: () => 'bafy-member-cid' },
    };
    (mockStoracha.createDelegation as any).mockResolvedValue(mockDelegation);

    const proof = await ucanService.delegateAccess(spaceDid, bobDid, 'member');

    expect(proof.abilities).toContain('space/blob/add');
    expect(proof.abilities).toContain('space/blob/list');
    expect(proof.abilities).not.toContain('space/car/add');
  });

  it('should verify access correctly based on abilities', async () => {
    const proofs: DelegationProof[] = [
      {
        cid: 'cid-1',
        audience: bobDid,
        abilities: ['space/blob/add', 'space/blob/list'],
        expiration: Math.floor(Date.now() / 1000) + 3600,
      },
    ];

    const canUpload = await ucanService.verifyAccess(proofs, ['space/blob/add']);
    const canBundle = await ucanService.verifyAccess(proofs, ['space/car/add']);

    expect(canUpload).toBe(true);
    expect(canBundle).toBe(false);
  });

  it('should handle expired delegations gracefully', async () => {
    const proofs: DelegationProof[] = [
      {
        cid: 'expired-cid',
        audience: bobDid,
        abilities: ['*'],
        expiration: Math.floor(Date.now() / 1000) - 10,
      },
    ];

    const hasAccess = await ucanService.verifyAccess(proofs, ['space/blob/add']);
    expect(hasAccess).toBe(false);
  });

  it('should allow owner full access for any required ability', async () => {
    const proofs: DelegationProof[] = [
      {
        cid: 'owner-cid',
        audience: aliceDid,
        abilities: ['*'],
        expiration: Math.floor(Date.now() / 1000) + 3600,
      },
    ];

    const canUpload = await ucanService.verifyAccess(proofs, ['space/blob/add']);
    const canBundle = await ucanService.verifyAccess(proofs, ['space/car/add']);
    const canAdmin = await ucanService.verifyAccess(proofs, ['space/delegation/add']);

    expect(canUpload).toBe(true);
    expect(canBundle).toBe(true);
    expect(canAdmin).toBe(true);
  });
});
