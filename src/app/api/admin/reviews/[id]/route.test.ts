import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  review: { update: vi.fn(), delete: vi.fn() },
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

import { PATCH, DELETE } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

function callPatch(id: string, body: Record<string, unknown>) {
  return PATCH(
    createRequest(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }) as never,
    { params: Promise.resolve({ id }) }
  );
}

function callDelete(id: string) {
  return DELETE(
    createRequest(`/api/admin/reviews/${id}`, { method: 'DELETE' }) as never,
    { params: Promise.resolve({ id }) }
  );
}

describe('PATCH /api/admin/reviews/[id]', () => {
  it('approves review', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.review.update.mockResolvedValue({ id: 'r1', status: 'approved' });

    const res = await callPatch('r1', { status: 'approved' });
    const body = await parseResponse<{ status: string }>(res);

    expect(res.status).toBe(200);
    expect(body.status).toBe('approved');
  });

  it('rejects review', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.review.update.mockResolvedValue({ id: 'r1', status: 'rejected' });

    const res = await callPatch('r1', { status: 'rejected' });
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid status', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });

    const res = await callPatch('r1', { status: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const res = await callPatch('r1', { status: 'approved' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/admin/reviews/[id]', () => {
  it('deletes review', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.review.delete.mockResolvedValue({});

    const res = await callDelete('r1');
    const body = await parseResponse<{ success: boolean }>(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const res = await callDelete('r1');
    expect(res.status).toBe(403);
  });
});
