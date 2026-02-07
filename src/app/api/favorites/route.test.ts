import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  favorite: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

import { GET, POST, DELETE } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/favorites', () => {
  it('returns favorite slugs', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.favorite.findMany.mockResolvedValue([
      { hotelSlug: 'hotel-a' },
      { hotelSlug: 'hotel-b' },
    ]);

    const res = await GET();
    const body = await parseResponse<string[]>(res);

    expect(res.status).toBe(200);
    expect(body).toEqual(['hotel-a', 'hotel-b']);
  });

  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe('POST /api/favorites', () => {
  it('adds favorite (upsert)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.favorite.upsert.mockResolvedValue({});

    const res = await POST(
      createRequest('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug: 'grand-hotel' }),
      })
    );
    const body = await parseResponse<{ ok: boolean }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(prisma.favorite.upsert).toHaveBeenCalledWith({
      where: { userId_hotelSlug: { userId: 'u1', hotelSlug: 'grand-hotel' } },
      update: {},
      create: { userId: 'u1', hotelSlug: 'grand-hotel' },
    });
  });

  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST(
      createRequest('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug: 'hotel' }),
      })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 without hotelSlug', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });

    const res = await POST(
      createRequest('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/favorites', () => {
  it('removes favorite', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    prisma.favorite.deleteMany.mockResolvedValue({ count: 1 });

    const res = await DELETE(
      createRequest('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug: 'grand-hotel' }),
      })
    );
    const body = await parseResponse<{ ok: boolean }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await DELETE(
      createRequest('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug: 'hotel' }),
      })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 without hotelSlug', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });

    const res = await DELETE(
      createRequest('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });
});
