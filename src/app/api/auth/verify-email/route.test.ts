import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRedirectUrl } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  verificationToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
}));

const mocks = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/tokens', () => ({ verifyToken: mocks.verifyToken }));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeReq(params: string) {
  return new Request(`http://localhost:3000/api/auth/verify-email${params}`);
}

describe('GET /api/auth/verify-email', () => {
  it('verifies email and redirects to /auth/email-verified', async () => {
    mocks.verifyToken.mockResolvedValue(true);
    prisma.user.update.mockResolvedValue({});

    const res = await GET(makeReq('?token=valid-token&email=user@example.com'));

    expect(res.status).toBe(307);
    expect(getRedirectUrl(res)).toContain('/auth/email-verified');
    expect(getRedirectUrl(res)).not.toContain('error');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { emailVerified: expect.any(Date) },
    });
  });

  it('redirects with error for invalid token', async () => {
    mocks.verifyToken.mockResolvedValue(false);

    const res = await GET(makeReq('?token=bad-token&email=user@example.com'));

    expect(res.status).toBe(307);
    expect(getRedirectUrl(res)).toContain('error=invalid');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('redirects to login when params missing', async () => {
    const res = await GET(makeReq(''));

    expect(res.status).toBe(307);
    expect(getRedirectUrl(res)).toContain('/auth/login');
  });

  it('redirects to login on server error', async () => {
    mocks.verifyToken.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeReq('?token=valid&email=user@example.com'));

    expect(res.status).toBe(307);
    expect(getRedirectUrl(res)).toContain('/auth/login');
  });
});
