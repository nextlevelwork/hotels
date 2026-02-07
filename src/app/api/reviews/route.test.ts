import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  review: { findMany: vi.fn(), create: vi.fn() },
  booking: { findFirst: vi.fn() },
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

import { GET, POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

const validReview = {
  hotelSlug: 'grand-hotel',
  rating: 8,
  title: 'Great stay',
  text: 'Really enjoyed my stay at the hotel, wonderful experience',
  travelerType: 'business',
};

function makeNextRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

describe('GET /api/reviews', () => {
  it('returns reviews for hotelSlug', async () => {
    prisma.review.findMany.mockResolvedValue([{ id: 'r1', title: 'Nice' }]);

    const res = await GET(makeNextRequest('/api/reviews?hotelSlug=grand-hotel'));
    const body = await parseResponse<unknown[]>(res);

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(prisma.review.findMany).toHaveBeenCalledWith({
      where: { hotelSlug: 'grand-hotel', status: 'approved' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns 400 without hotelSlug', async () => {
    const res = await GET(makeNextRequest('/api/reviews'));

    expect(res.status).toBe(400);
  });
});

describe('POST /api/reviews', () => {
  it('creates review (201)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', name: 'Ivan' } });
    prisma.booking.findFirst.mockResolvedValue({ id: 'b1' });
    prisma.review.create.mockResolvedValue({ id: 'r1', ...validReview });

    const res = await POST(
      makeNextRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validReview),
      })
    );

    expect(res.status).toBe(201);
  });

  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST(
      makeNextRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validReview),
      })
    );

    expect(res.status).toBe(401);
  });

  it('returns 403 without confirmed booking', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', name: 'Ivan' } });
    prisma.booking.findFirst.mockResolvedValue(null);

    const res = await POST(
      makeNextRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validReview),
      })
    );

    expect(res.status).toBe(403);
  });

  it('returns 409 on duplicate review (P2002)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', name: 'Ivan' } });
    prisma.booking.findFirst.mockResolvedValue({ id: 'b1' });
    prisma.review.create.mockRejectedValue({ code: 'P2002' });

    const res = await POST(
      makeNextRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validReview),
      })
    );

    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid rating', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', name: 'Ivan' } });

    const res = await POST(
      makeNextRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validReview, rating: 15 }),
      })
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for short title', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', name: 'Ivan' } });

    const res = await POST(
      makeNextRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validReview, title: 'AB' }),
      })
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for short text', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', name: 'Ivan' } });

    const res = await POST(
      makeNextRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validReview, text: 'Short' }),
      })
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid travelerType', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', name: 'Ivan' } });

    const res = await POST(
      makeNextRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validReview, travelerType: 'alien' }),
      })
    );

    expect(res.status).toBe(400);
  });
});
