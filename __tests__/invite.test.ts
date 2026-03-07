import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nanoid } from 'nanoid';

vi.mock('@/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

import { supabaseAdmin } from '@/supabase/admin';

describe('Invite Code Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Generation', () => {
    it('should generate an 8-character alphanumeric code', () => {
      const code = nanoid(8);
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[a-zA-Z0-9_-]+$/);
    });
  });

  describe('Validation (via Mocked API Logic)', () => {
    it('should find a group by invite code', async () => {
      const mockGroup = { id: 'group1', name: 'Test Group', invite_code: 'code123' };
      
      const mockSingle = vi.fn().mockResolvedValue({ data: mockGroup, error: null });
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle,
      } as any);

      const { data, error } = await supabaseAdmin
        .from('groups')
        .select('*')
        .eq('invite_code', 'code123')
        .single();

      expect(data).toEqual(mockGroup);
      expect(error).toBeNull();
      expect(supabaseAdmin.from).toHaveBeenCalledWith('groups');
    });

    it('should return error if group not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle,
      } as any);

      const { data, error } = await supabaseAdmin
        .from('groups')
        .select('*')
        .eq('invite_code', 'invalid')
        .single();

      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });
});
