import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  review: {
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

function makeNextRequest(url: string) {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('GET /api/admin/reviews', () => {
  it('returns paginated reviews', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.review.findMany.mockResolvedValue([{ id: 'r1' }]);
    prisma.review.count.mockResolvedValue(1);

    const res = await GET(makeNextRequest('/api/admin/reviews?page=1'));
    const body = await parseResponse<{
      reviews: unknown[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.reviews).toHaveLength(1);
    expect(body.total).toBe(1);
  });

  it('supports search filter', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.review.findMany.mockResolvedValue([]);
    prisma.review.count.mockResolvedValue(0);

    await GET(makeNextRequest('/api/admin/reviews?search=test'));

    const where = prisma.review.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const res = await GET(makeNextRequest('/api/admin/reviews'));
    expect(res.status).toBe(403);
  });
});
