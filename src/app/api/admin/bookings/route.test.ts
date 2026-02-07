import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  booking: {
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

describe('GET /api/admin/bookings', () => {
  it('returns paginated bookings', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.booking.findMany.mockResolvedValue([{ id: 'b1' }]);
    prisma.booking.count.mockResolvedValue(1);

    const res = await GET(
      createRequest('/api/admin/bookings?page=1&limit=20')
    );
    const body = await parseResponse<{
      bookings: unknown[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.bookings).toHaveLength(1);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
  });

  it('supports search filter', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.booking.count.mockResolvedValue(0);

    await GET(
      createRequest('/api/admin/bookings?search=ivan')
    );

    const where = prisma.booking.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
    expect(where.OR.length).toBeGreaterThan(0);
  });

  it('supports status filter', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.booking.count.mockResolvedValue(0);

    await GET(
      createRequest('/api/admin/bookings?status=confirmed')
    );

    const where = prisma.booking.findMany.mock.calls[0][0].where;
    expect(where.status).toBe('confirmed');
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const res = await GET(
      createRequest('/api/admin/bookings')
    );
    expect(res.status).toBe(403);
  });
});
