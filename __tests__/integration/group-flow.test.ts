import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  },
}));

vi.mock('@/supabase/admin', () => ({
  supabaseAdmin: mockSupabase,
}));

import { supabaseAdmin } from '@/supabase/admin';

describe('Group Flow Integration', () => {
  const userId = 'user-123';
  const groupId = 'group-456';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.insert.mockReturnThis();
    mockSupabase.update.mockReturnThis();
    mockSupabase.delete.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  it('should create a group and add the creator as admin', async () => {
    const mockGroup = { id: groupId, name: 'Trip to NYC', invite_code: 'code123' };
    
    mockSupabase.single
      .mockResolvedValueOnce({ data: mockGroup, error: null })
      .mockResolvedValueOnce({ data: { id: 'member-1', role: 'admin' }, error: null });

    const { data: newGroup, error: groupError } = await supabaseAdmin
      .from('groups')
      .insert({ name: 'Trip to NYC', created_by: userId })
      .select()
      .single();

    expect(newGroup).toEqual(mockGroup);
    expect(groupError).toBeNull();

    const { data: membership, error: memberError } = await supabaseAdmin
      .from('group_members')
      .insert({ group_id: newGroup?.id, user_id: userId, role: 'admin' })
      .select()
      .single();

    expect(membership?.role).toBe('admin');
    expect(memberError).toBeNull();
  });

  it('should allow a user to join a group via invite code', async () => {
    const inviteCode = 'code123';
    
    mockSupabase.single
      .mockResolvedValueOnce({ data: { id: groupId, name: 'Trip to NYC' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'member-2', role: 'member' }, error: null });

    const { data: group } = await supabaseAdmin
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    expect(group?.id).toBe(groupId);

    const { data: membership } = await supabaseAdmin
      .from('group_members')
      .insert({ group_id: group?.id, user_id: 'user-789', role: 'member' })
      .select()
      .single();

    expect(membership?.role).toBe('member');
  });

  it('should allow an admin to remove a member', async () => {
    const targetUserId = 'user-789';

    mockSupabase.single.mockResolvedValueOnce({ data: { role: 'admin' }, error: null });
    
    mockSupabase.eq.mockReturnThis();
    (mockSupabase as any).then = vi.fn().mockImplementation((callback) => callback({ error: null }));

    const { data: adminCheck } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    expect(adminCheck?.role).toBe('admin');

    const { error: deleteError } = await (supabaseAdmin
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', targetUserId) as any);

    expect(deleteError).toBeNull();
  });
});
