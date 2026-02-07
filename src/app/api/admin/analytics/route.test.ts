import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseResponse } from '@/test-utils';
import { NextRequest } from 'next/server';

const prisma = vi.hoisted(() => ({
  booking: { findMany: vi.fn() },
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

function callGET(params = '') {
  return GET(new NextRequest(new URL('/api/admin/analytics' + params, 'http://localhost:3000')));
}

describe('GET /api/admin/analytics', () => {
  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });
    const res = await callGET();
    expect(res.status).toBe(403);
  });

  it('returns analytics data', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.booking.findMany.mockResolvedValue([
      {
        id: 'b1',
        hotelName: 'Отель А',
        finalPrice: 10000,
        paymentMethod: 'card',
        status: 'confirmed',
        nights: 3,
        createdAt: new Date('2026-01-15'),
      },
      {
        id: 'b2',
        hotelName: 'Отель А',
        finalPrice: 8000,
        paymentMethod: 'sbp',
        status: 'confirmed',
        nights: 2,
        createdAt: new Date('2026-01-15'),
      },
      {
        id: 'b3',
        hotelName: 'Отель Б',
        finalPrice: 5000,
        paymentMethod: 'cash',
        status: 'cancelled',
        nights: 1,
        createdAt: new Date('2026-01-16'),
      },
    ]);

    const res = await callGET('?groupBy=day');
    const data = await parseResponse<{
      revenue: { date: string; amount: number; count: number }[];
      bookingsByStatus: { confirmed: number; cancelled: number };
      topHotels: { hotelName: string; revenue: number; bookings: number }[];
      paymentMethods: Record<string, number>;
      averageBooking: { averageCheck: number; averageNights: number };
    }>(res);

    expect(res.status).toBe(200);
    expect(data.revenue).toHaveLength(2);
    expect(data.bookingsByStatus).toEqual({ confirmed: 2, cancelled: 1 });
    expect(data.topHotels[0].hotelName).toBe('Отель А');
    expect(data.topHotels[0].revenue).toBe(18000);
    expect(data.paymentMethods).toEqual({ card: 1, sbp: 1, cash: 1 });
    expect(data.averageBooking.averageCheck).toBe(7667);
    expect(data.averageBooking.averageNights).toBe(2);
  });

  it('returns empty analytics when no bookings', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.booking.findMany.mockResolvedValue([]);

    const res = await callGET();
    const data = await parseResponse<{
      revenue: unknown[];
      averageBooking: { averageCheck: number; averageNights: number };
    }>(res);

    expect(res.status).toBe(200);
    expect(data.revenue).toHaveLength(0);
    expect(data.averageBooking.averageCheck).toBe(0);
  });
});
