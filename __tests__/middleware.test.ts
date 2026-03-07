import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuth, withMiddleware, createResponse } from '../lib/api-utils';
import { AuthenticationError } from '../lib/errors';
import * as jose from 'jose';

vi.mock('jose', () => ({
  decodeJwt: vi.fn(),
}));

vi.mock('../lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      status: options?.status || 200,
    })),
  },
}));

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withAuth', () => {
    it('should fail if Authorization header is missing', async () => {
      const handler = vi.fn();
      const wrapped = withAuth(handler);
      const req = new Request('http://localhost/api', { headers: {} });

      const res = await wrapped(req);
      expect(res.status).toBe(401);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should fail if Authorization header is invalid', async () => {
      const handler = vi.fn();
      const wrapped = withAuth(handler);
      const req = new Request('http://localhost/api', {
        headers: { Authorization: 'Invalid token' },
      });

      const res = await wrapped(req);
      expect(res.status).toBe(401);
    });

    it('should succeed with a valid Bearer token', async () => {
      const handler = vi.fn().mockResolvedValue({ status: 200 });
      const wrapped = withAuth(handler);
      const req = new Request('http://localhost/api', {
        headers: { Authorization: 'Bearer valid-token' },
      });

      vi.mocked(jose.decodeJwt).mockReturnValue({ sub: 'user-123' });

      const res = await wrapped(req);
      expect(res.status).toBe(200);
      expect(handler).toHaveBeenCalled();
      const authReq = handler.mock.calls[0][0];
      expect(authReq.user.id).toBe('user-123');
    });
  });

  describe('withMiddleware', () => {
    it('should combine auth and validation', async () => {
      const handler = vi.fn().mockResolvedValue({ status: 200 });
      const schema = { parse: vi.fn((body) => body) };
      
      const wrapped = withMiddleware(handler, {
        auth: true,
        validation: { schema: schema as any },
        rateLimit: false,
      });

      const req = new Request('http://localhost/api', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' }),
      });

      vi.mocked(jose.decodeJwt).mockReturnValue({ sub: 'user-123' });

      const res = await wrapped(req);
      expect(res.status).toBe(200);
      expect(handler).toHaveBeenCalled();
      const finalReq = handler.mock.calls[0][0];
      expect(finalReq.user.id).toBe('user-123');
      expect(finalReq.validatedBody).toEqual({ test: 'data' });
    });
  });
});
