import { describe, it, expect, vi, beforeEach } from 'vitest';

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

function createRequest(params = '') {
  return new Request(new URL('/api/admin/bookings/export' + params, 'http://localhost:3000'));
}

describe('GET /api/admin/bookings/export', () => {
  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });
    const res = await GET(createRequest());
    expect(res.status).toBe(403);
  });

  it('returns CSV with BOM and correct headers', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.booking.findMany.mockResolvedValue([
      {
        bookingId: 'GOS-TEST1',
        hotelName: 'Тест Отель',
        roomName: 'Стандарт',
        guestFirstName: 'Иван',
        guestLastName: 'Петров',
        guestEmail: 'ivan@test.com',
        guestPhone: '+79991234567',
        checkIn: '2026-02-01',
        checkOut: '2026-02-03',
        nights: 2,
        pricePerNight: 5000,
        discount: 0,
        finalPrice: 10000,
        bonusSpent: 0,
        paymentMethod: 'card',
        status: 'confirmed',
        createdAt: new Date('2026-01-30T10:00:00'),
      },
    ]);

    const res = await GET(createRequest());
    const text = await res.text();

    expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="bookings.csv"');

    // Header row
    expect(text).toContain('"ID"');
    expect(text).toContain('"Отель"');

    // Data row
    expect(text).toContain('GOS-TEST1');
    expect(text).toContain('Тест Отель');
    expect(text).toContain('ivan@test.com');

    // Semicolon delimiter
    const lines = text.split('\n');
    expect(lines[0]).toContain(';');
  });

  it('filters by status', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.booking.findMany.mockResolvedValue([]);

    await GET(createRequest('?status=confirmed'));

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'confirmed' }),
      })
    );
  });
});
