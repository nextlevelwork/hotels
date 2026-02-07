import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  review: { findUnique: vi.fn(), delete: vi.fn() },
}));

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

import { DELETE } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

function callDelete(id: string) {
  return DELETE(
    createRequest(`/api/reviews/${id}`, { method: 'DELETE' }) as never,
    { params: Promise.resolve({ id }) }
  );
}

describe('DELETE /api/reviews/[id]', () => {
  it('deletes own review', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u1' });
    prisma.review.delete.mockResolvedValue({});

    const res = await callDelete('r1');
    const body = await parseResponse<{ success: boolean }>(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });

  it('returns 403 for other user review', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u2' });

    const res = await callDelete('r1');
    expect(res.status).toBe(403);
  });

  it('returns 404 for nonexistent review', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });
    prisma.review.findUnique.mockResolvedValue(null);

    const res = await callDelete('r-nonexistent');
    expect(res.status).toBe(404);
  });

  it('admin can delete any review', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1', role: 'admin' } });
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u2' });
    prisma.review.delete.mockResolvedValue({});

    const res = await callDelete('r1');
    expect(res.status).toBe(200);
  });

  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await callDelete('r1');
    expect(res.status).toBe(401);
  });
});
