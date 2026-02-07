import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('$2a$12$mocked'), compare: vi.fn() } }));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/profile', () => {
  it('returns hasPassword: true when user has passwordHash', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1' } });
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      name: 'Test',
      email: 'test@example.com',
      phone: null,
      emailNotifications: true,
      emailVerified: null,
      createdAt: new Date(),
      passwordHash: '$2a$12$hashed',
    });

    const res = await GET();
    const body = await parseResponse<{ hasPassword: boolean; passwordHash?: string }>(res);

    expect(res.status).toBe(200);
    expect(body.hasPassword).toBe(true);
    expect(body.passwordHash).toBeUndefined();
  });

  it('returns hasPassword: false when user has no passwordHash (OAuth)', async () => {
    mockAuth.mockResolvedValue({ user: { id: '2' } });
    prisma.user.findUnique.mockResolvedValue({
      id: '2',
      name: 'OAuth User',
      email: 'oauth@example.com',
      phone: null,
      emailNotifications: true,
      emailVerified: new Date(),
      createdAt: new Date(),
      passwordHash: null,
    });

    const res = await GET();
    const body = await parseResponse<{ hasPassword: boolean }>(res);

    expect(res.status).toBe(200);
    expect(body.hasPassword).toBe(false);
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });
});
