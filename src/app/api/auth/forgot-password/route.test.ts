import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  verificationToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
}));

const mocks = vi.hoisted(() => ({
  generatePasswordResetToken: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/tokens', () => ({ generatePasswordResetToken: mocks.generatePasswordResetToken }));
vi.mock('@/lib/email', () => ({ sendPasswordResetEmail: mocks.sendPasswordResetEmail }));

import { POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/forgot-password', () => {
  it('sends reset email for existing user and returns 200', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'user@example.com' });
    mocks.generatePasswordResetToken.mockResolvedValue('reset-token');

    const req = createRequest('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const res = await POST(req);
    const body = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('message');
    expect(mocks.generatePasswordResetToken).toHaveBeenCalledWith('user@example.com');
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith('user@example.com', 'reset-token');
  });

  it('returns 200 for non-existent email (security: same response)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const req = createRequest('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@example.com' }),
    });

    const res = await POST(req);
    const body = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('message');
    expect(mocks.generatePasswordResetToken).not.toHaveBeenCalled();
    expect(mocks.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('returns 200 for invalid email format (security: same response)', async () => {
    const req = createRequest('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mocks.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('returns 500 on server error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB down'));

    const req = createRequest('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const res = await POST(req);
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});
