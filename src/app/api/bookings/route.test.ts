import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  booking: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  bonusTransaction: { create: vi.fn() },
  $transaction: vi.fn(),
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/email', () => ({ sendBookingConfirmation: vi.fn().mockResolvedValue(undefined) }));

import { GET, POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

const validBody = {
  bookingId: 'BK-123456',
  hotelSlug: 'grand-hotel',
  hotelName: 'Grand Hotel',
  roomName: 'Deluxe',
  checkIn: '2025-08-01',
  checkOut: '2025-08-03',
  nights: 2,
  guests: 2,
  pricePerNight: 5000,
  totalPrice: 10000,
  discount: 0,
  finalPrice: 10000,
  paymentMethod: 'card',
  status: 'confirmed',
  guestFirstName: 'Ivan',
  guestLastName: 'Ivanov',
  guestEmail: 'ivan@example.com',
  guestPhone: '+79991234567',
};

describe('GET /api/bookings', () => {
  it('returns user bookings', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.findMany.mockResolvedValue([{ id: 'b1', bookingId: 'BK-1' }]);

    const res = await GET();
    const body = await parseResponse<unknown[]>(res);

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe('POST /api/bookings', () => {
  it('creates booking without bonuses (201)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.findUnique.mockResolvedValue(null);
    const created = { id: 'b1', ...validBody };
    prisma.booking.create.mockResolvedValue(created);

    const res = await POST(
      createRequest('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      })
    );
    const body = await parseResponse<{ id: string }>(res);

    expect(res.status).toBe(201);
    expect(body.id).toBe('b1');
    expect(prisma.booking.create).toHaveBeenCalled();
  });

  it('creates booking with bonuses via transaction', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({ bonusBalance: 5000 });

    const txBooking = { id: 'b2', ...validBody, bonusSpent: 2000 };
    prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        booking: { create: vi.fn().mockResolvedValue(txBooking) },
        user: { update: vi.fn().mockResolvedValue({}) },
        bonusTransaction: { create: vi.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    const res = await POST(
      createRequest('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, bonusSpent: 2000 }),
      })
    );

    expect(res.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('returns duplicate bookingId as 200 (already saved)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.findUnique.mockResolvedValue({ id: 'existing' });

    const res = await POST(
      createRequest('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      })
    );
    const body = await parseResponse<{ message: string }>(res);

    expect(res.status).toBe(200);
    expect(body.message).toContain('уже сохранено');
  });

  it('returns 400 when required fields missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });

    const res = await POST(
      createRequest('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: 'BK-1' }),
      })
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 when bonusSpent exceeds 50% limit', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.findUnique.mockResolvedValue(null);

    const res = await POST(
      createRequest('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, totalPrice: 10000, bonusSpent: 8000 }),
      })
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 when user has insufficient bonus balance', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({ bonusBalance: 100 });

    const res = await POST(
      createRequest('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, totalPrice: 10000, bonusSpent: 3000 }),
      })
    );

    expect(res.status).toBe(400);
  });
});
