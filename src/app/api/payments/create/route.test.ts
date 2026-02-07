import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  booking: { updateMany: vi.fn() },
}));

const mockAuth = vi.hoisted(() => vi.fn());
const mockCreatePayment = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/yookassa', () => ({ createPayment: mockCreatePayment }));

import { POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/payments/create', () => {
  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);
    const req = createRequest('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ bookingId: 'GOS-123', amount: 5000 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 without bookingId or amount', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    const req = createRequest('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles cash payment without YooKassa', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });

    const req = createRequest('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ bookingId: 'GOS-123', amount: 5000, paymentMethod: 'cash' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(data).toEqual({ status: 'cash', confirmationUrl: null });
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: { bookingId: 'GOS-123' },
      data: { paymentStatus: 'succeeded' },
    });
    expect(mockCreatePayment).not.toHaveBeenCalled();
  });

  it('creates YooKassa payment for card', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    mockCreatePayment.mockResolvedValue({
      id: 'pay-123',
      status: 'pending',
      confirmation: { confirmation_url: 'https://yookassa.ru/pay/123' },
    });
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });

    const req = createRequest('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ bookingId: 'GOS-123', amount: 5000, paymentMethod: 'card' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(data).toEqual({
      paymentId: 'pay-123',
      confirmationUrl: 'https://yookassa.ru/pay/123',
      status: 'pending',
    });
    expect(mockCreatePayment).toHaveBeenCalled();
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: { bookingId: 'GOS-123' },
      data: { paymentId: 'pay-123', paymentStatus: 'pending' },
    });
  });
});
