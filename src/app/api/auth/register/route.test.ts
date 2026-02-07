import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  verificationToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
}));

const mocks = vi.hoisted(() => ({
  generateVerificationToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/tokens', () => ({ generateVerificationToken: mocks.generateVerificationToken }));
vi.mock('@/lib/email', () => ({ sendVerificationEmail: mocks.sendVerificationEmail }));
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('$2a$12$mocked'), compare: vi.fn() } }));

import { POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeReq(body: Record<string, unknown>) {
  return createRequest('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: 'Test User',
  email: 'new@example.com',
  password: 'password123',
};

describe('POST /api/auth/register', () => {
  it('creates user and returns 201', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'new@example.com',
    });
    mocks.generateVerificationToken.mockResolvedValue('verify-token');

    const res = await POST(makeReq(validBody));
    const body = await parseResponse<{ id: string; email: string }>(res);

    expect(res.status).toBe(201);
    expect(body.id).toBe('1');
    expect(body.email).toBe('new@example.com');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'new@example.com',
        phone: undefined,
        passwordHash: '$2a$12$mocked',
      },
      select: { id: true, name: true, email: true },
    });
  });

  it('returns 409 for duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'new@example.com' });

    const res = await POST(makeReq(validBody));
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(409);
    expect(body.error).toBeDefined();
  });

  it('returns 400 for invalid email', async () => {
    const res = await POST(makeReq({ ...validBody, email: 'not-email' }));
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it('returns 400 for short password', async () => {
    const res = await POST(makeReq({ ...validBody, password: '123' }));
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it('returns 400 for short name', async () => {
    const res = await POST(makeReq({ ...validBody, name: 'A' }));
    const body = await parseResponse<{ error: string }>(res);

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it('fires verification email asynchronously', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'new@example.com',
    });
    mocks.generateVerificationToken.mockResolvedValue('verify-token');

    await POST(makeReq(validBody));

    // Wait for the fire-and-forget .then() chain to resolve
    await vi.waitFor(() => {
      expect(mocks.generateVerificationToken).toHaveBeenCalledWith('new@example.com');
    });
  });
});
