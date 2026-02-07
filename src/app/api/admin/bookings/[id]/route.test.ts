import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  booking: { update: vi.fn() },
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

import { PATCH } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

function callPatch(id: string, body: Record<string, unknown>) {
  return PATCH(
    createRequest(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );
}

describe('PATCH /api/admin/bookings/[id]', () => {
  it('updates booking status', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.booking.update.mockResolvedValue({ id: 'b1', status: 'cancelled' });

    const res = await callPatch('b1', { status: 'cancelled' });
    const body = await parseResponse<{ status: string }>(res);

    expect(res.status).toBe(200);
    expect(body.status).toBe('cancelled');
  });

  it('returns 400 for invalid status', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });

    const res = await callPatch('b1', { status: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing status', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });

    const res = await callPatch('b1', {});
    expect(res.status).toBe(400);
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const res = await callPatch('b1', { status: 'cancelled' });
    expect(res.status).toBe(403);
  });
});
