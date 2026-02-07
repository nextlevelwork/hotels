import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  booking: {
    count: vi.fn(),
    aggregate: vi.fn(),
    findMany: vi.fn(),
  },
  user: { count: vi.fn() },
  review: { count: vi.fn() },
  bonusTransaction: { aggregate: vi.fn() },
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

describe('GET /api/admin/stats', () => {
  it('returns stats for admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });

    prisma.booking.count
      .mockResolvedValueOnce(10)   // totalBookings
      .mockResolvedValueOnce(2);   // bookingsToday
    prisma.user.count.mockResolvedValue(5);
    prisma.booking.aggregate.mockResolvedValue({ _sum: { finalPrice: 100000 } });
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.review.count
      .mockResolvedValueOnce(3)   // totalReviews
      .mockResolvedValueOnce(1);  // rejectedReviews
    prisma.bonusTransaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 5000 } })   // bonusIssued
      .mockResolvedValueOnce({ _sum: { amount: -2000 } }); // bonusSpent

    const res = await GET();
    const body = await parseResponse<{
      totalBookings: number;
      totalUsers: number;
      totalRevenue: number;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.totalBookings).toBe(10);
    expect(body.totalUsers).toBe(5);
    expect(body.totalRevenue).toBe(100000);
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const res = await GET();
    expect(res.status).toBe(403);
  });
});
