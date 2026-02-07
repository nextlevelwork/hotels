import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, parseResponse } from '@/test-utils';

const prisma = vi.hoisted(() => ({
  user: { update: vi.fn() },
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
    createRequest(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );
}

describe('PATCH /api/admin/users/[id]', () => {
  it('changes user role', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });
    prisma.user.update.mockResolvedValue({ id: 'u1', name: 'User', email: 'u@test.com', role: 'admin' });

    const res = await callPatch('u1', { role: 'admin' });
    const body = await parseResponse<{ role: string }>(res);

    expect(res.status).toBe(200);
    expect(body.role).toBe('admin');
  });

  it('returns 400 when changing own role away from admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });

    const res = await callPatch('a1', { role: 'user' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid role', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });

    const res = await callPatch('u1', { role: 'superadmin' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing role', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a1', role: 'admin' } });

    const res = await callPatch('u1', {});
    expect(res.status).toBe(400);
  });

  it('returns 403 for non-admin', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const res = await callPatch('u2', { role: 'admin' });
    expect(res.status).toBe(403);
  });
});
