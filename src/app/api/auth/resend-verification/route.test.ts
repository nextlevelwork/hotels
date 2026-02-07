import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  verificationToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
}));

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  generateVerificationToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mocks.auth }));
vi.mock('@/lib/tokens', () => ({ generateVerificationToken: mocks.generateVerificationToken }));
vi.mock('@/lib/email', () => ({ sendVerificationEmail: mocks.sendVerificationEmail }));

import { POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/resend-verification', () => {
  it('sends verification email for authorized unverified user', async () => {
    mocks.auth.mockResolvedValue({ user: { id: '1' } });
    prisma.user.findUnique.mockResolvedValue({
      email: 'user@example.com',
      emailVerified: null,
    });
    mocks.generateVerificationToken.mockResolvedValue('new-token');

    const res = await POST();
    const body = await parseResponse<{ message: string }>(res);

    expect(res.status).toBe(200);
    expect(body.message).toBe('Письмо отправлено');
    expect(mocks.generateVerificationToken).toHaveBeenCalledWith('user@example.com');
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith('user@example.com', 'new-token');
  });

  it('returns 401 when not authorized', async () => {
    mocks.auth.mockResolvedValue(null);

    const res = await POST();
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(401);
    expect(body.error).toBeDefined();
  });

  it('returns 200 "already verified" for verified user', async () => {
    mocks.auth.mockResolvedValue({ user: { id: '1' } });
    prisma.user.findUnique.mockResolvedValue({
      email: 'user@example.com',
      emailVerified: new Date(),
    });

    const res = await POST();
    const body = await parseResponse<{ message: string }>(res);

    expect(res.status).toBe(200);
    expect(body.message).toBe('Email уже подтверждён');
    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('returns 404 when user not found', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'ghost' } });
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await POST();
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(404);
    expect(body.error).toBeDefined();
  });
});
