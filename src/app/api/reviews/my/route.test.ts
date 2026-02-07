import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  review: { findMany: vi.fn() },
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/reviews/my', () => {
  it('returns list of hotelSlugs', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.review.findMany.mockResolvedValue([
      { hotelSlug: 'hotel-a' },
      { hotelSlug: 'hotel-b' },
    ]);

    const res = await GET();
    const body = await parseResponse<string[]>(res);

    expect(res.status).toBe(200);
    expect(body).toEqual(['hotel-a', 'hotel-b']);
    expect(prisma.review.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      select: { hotelSlug: true },
    });
  });

  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });
});
