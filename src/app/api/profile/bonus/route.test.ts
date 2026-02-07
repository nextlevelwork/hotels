import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  booking: {
    findMany: vi.fn(),
    aggregate: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  bonusTransaction: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/profile/bonus', () => {
  it('returns balance, tier and transactions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });

    // No eligible bookings for auto-credit
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.user.findUnique.mockResolvedValue({ bonusBalance: 500 });
    prisma.booking.aggregate.mockResolvedValue({ _sum: { finalPrice: 30000 } });
    prisma.bonusTransaction.findMany.mockResolvedValue([
      { id: 't1', amount: 500, type: 'earn', description: 'Кешбэк', createdAt: new Date('2025-01-01') },
    ]);

    const res = await GET();
    const body = await parseResponse<{
      balance: number;
      totalSpent: number;
      tier: { tier: string; cashbackPercent: number };
      transactions: unknown[];
    }>(res);

    expect(res.status).toBe(200);
    expect(body.balance).toBe(500);
    expect(body.totalSpent).toBe(30000);
    expect(body.tier.tier).toBe('bronze');
    expect(body.tier.cashbackPercent).toBe(5);
    expect(body.transactions).toHaveLength(1);
  });

  it('auto-credits bonuses for completed bookings', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });

    // Eligible booking
    prisma.booking.findMany.mockResolvedValueOnce([
      { id: 'b1', bookingId: 'BK-1', finalPrice: 10000, bonusEarned: 0 },
    ]);

    // Aggregate for tier calculation
    prisma.booking.aggregate
      .mockResolvedValueOnce({ _sum: { finalPrice: 10000 } })  // for tier
      .mockResolvedValueOnce({ _sum: { finalPrice: 10000 } }); // after credit

    prisma.$transaction.mockResolvedValue(undefined);
    prisma.user.findUnique.mockResolvedValue({ bonusBalance: 500 });
    prisma.bonusTransaction.findMany.mockResolvedValue([]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });
});
