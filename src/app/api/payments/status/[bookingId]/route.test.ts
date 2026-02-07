import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseResponse } from '@/test-utils';
import { NextRequest } from 'next/server';

const prisma = vi.hoisted(() => ({
  booking: { findUnique: vi.fn() },
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

function callGET(bookingId: string) {
  const request = new NextRequest(new URL('/api/payments/status/' + bookingId, 'http://localhost:3000'));
  return GET(request, { params: Promise.resolve({ bookingId }) });
}

describe('GET /api/payments/status/[bookingId]', () => {
  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await callGET('GOS-123');
    expect(res.status).toBe(401);
  });

  it('returns 404 for missing booking', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.findUnique.mockResolvedValue(null);
    const res = await callGET('GOS-999');
    expect(res.status).toBe(404);
  });

  it('returns payment status', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.findUnique.mockResolvedValue({
      paymentStatus: 'succeeded',
      paymentId: 'pay-1',
      status: 'confirmed',
    });
    const res = await callGET('GOS-123');
    const data = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(data).toEqual({
      paymentStatus: 'succeeded',
      bookingStatus: 'confirmed',
      paymentId: 'pay-1',
    });
  });
});
