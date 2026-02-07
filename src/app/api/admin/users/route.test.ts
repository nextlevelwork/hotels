import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/admin', () => ({
  requireAdmin: vi.fn().mockImplementation(async () => {
    const session = await mockAuth();
    if (!session?.user || session.user.role !== 'admin') return null;
    return session;
  }),
}));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/admin/users', () => {
  it('returns paginated users', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.user.findMany.mockResolvedValue([
      { id: 'u1', name: 'Test', email: 'test@test.com', role: 'user', _count: { bookings: 2 } },
    ]);
    prisma.user.count.mockResolvedValue(1);

    const res = await GET(
      createRequest('/api/admin/users?page=1&limit=20')
    );
    const body = await parseResponse<{
      users: unknown[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.users).toHaveLength(1);
    expect(body.total).toBe(1);
  });

  it('supports search filter', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);

    await GET(
      createRequest('/api/admin/users?search=ivan')
    );

    const where = prisma.user.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
  });

  it('supports role filter', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);

    await GET(
      createRequest('/api/admin/users?role=admin')
    );

    const where = prisma.user.findMany.mock.calls[0][0].where;
    expect(where.role).toBe('admin');
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const res = await GET(
      createRequest('/api/admin/users')
    );
    expect(res.status).toBe(403);
  });
});
