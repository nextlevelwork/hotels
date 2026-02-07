import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  verificationToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
}));

const mocks = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/tokens', () => ({ verifyToken: mocks.verifyToken }));
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('$2a$12$mocked'), compare: vi.fn() } }));

import { POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeReq(body: Record<string, unknown>) {
  return createRequest('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/reset-password', () => {
  it('resets password with valid token', async () => {
    mocks.verifyToken.mockResolvedValue(true);
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'user@example.com' });
    prisma.user.update.mockResolvedValue({});

    const res = await POST(makeReq({
      email: 'user@example.com',
      token: 'valid-token',
      password: 'newpassword123',
    }));
    const body = await parseResponse<{ message: string }>(res);

    expect(res.status).toBe(200);
    expect(body.message).toBeDefined();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { passwordHash: '$2a$12$mocked' },
    });
  });

  it('returns 400 for invalid/expired token', async () => {
    mocks.verifyToken.mockResolvedValue(false);

    const res = await POST(makeReq({
      email: 'user@example.com',
      token: 'bad-token',
      password: 'newpassword123',
    }));
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns 400 when user not found', async () => {
    mocks.verifyToken.mockResolvedValue(true);
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await POST(makeReq({
      email: 'ghost@example.com',
      token: 'valid-token',
      password: 'newpassword123',
    }));
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it('returns 400 for short password', async () => {
    const res = await POST(makeReq({
      email: 'user@example.com',
      token: 'valid-token',
      password: '123',
    }));
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it('returns 500 on server error', async () => {
    mocks.verifyToken.mockRejectedValue(new Error('DB down'));

    const res = await POST(makeReq({
      email: 'user@example.com',
      token: 'valid-token',
      password: 'newpassword123',
    }));
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});
