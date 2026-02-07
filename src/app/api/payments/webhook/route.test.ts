import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  booking: { updateMany: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ prisma }));

import { POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/payments/webhook', () => {
  it('returns 400 for invalid JSON', async () => {
    const req = createRequest('/api/payments/webhook', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 without payment id', async () => {
    const req = createRequest('/api/payments/webhook', {
      method: 'POST',
      body: JSON.stringify({ event: 'payment.succeeded', object: {} }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles payment.succeeded with bookingId', async () => {
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });
    const req = createRequest('/api/payments/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'payment.succeeded',
        object: { id: 'pay-1', status: 'succeeded', metadata: { bookingId: 'GOS-123' } },
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: { bookingId: 'GOS-123' },
      data: { paymentStatus: 'succeeded', status: 'confirmed' },
    });
  });

  it('handles payment.succeeded with paymentId only', async () => {
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });
    const req = createRequest('/api/payments/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'payment.succeeded',
        object: { id: 'pay-1', status: 'succeeded' },
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    await POST(req);
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: { paymentId: 'pay-1' },
      data: { paymentStatus: 'succeeded', status: 'confirmed' },
    });
  });

  it('handles payment.canceled', async () => {
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });
    const req = createRequest('/api/payments/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'payment.canceled',
        object: { id: 'pay-2', status: 'canceled', metadata: { bookingId: 'GOS-456' } },
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: { bookingId: 'GOS-456' },
      data: { paymentStatus: 'canceled', status: 'payment_failed' },
    });
  });

  it('ignores unknown events', async () => {
    const req = createRequest('/api/payments/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'refund.succeeded',
        object: { id: 'ref-1', status: 'succeeded' },
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.booking.updateMany).not.toHaveBeenCalled();
  });
});
