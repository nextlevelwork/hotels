import { describe, it, expect, vi, beforeEach } from 'vitest';

const prisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  verificationToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma }));

import {
  generateVerificationToken,
  generatePasswordResetToken,
  verifyToken,
} from '@/lib/tokens';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('generateVerificationToken', () => {
  it('deletes existing tokens and creates a new one with 24h TTL', async () => {
    prisma.verificationToken.create.mockResolvedValue({
      identifier: 'user@example.com',
      token: 'any',
      expires: new Date(),
    });

    const token = await generateVerificationToken('user@example.com');

    expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'user@example.com' },
    });
    expect(prisma.verificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        identifier: 'user@example.com',
        token: expect.any(String),
      }),
    });

    // Check TTL is ~24 hours
    const createCall = prisma.verificationToken.create.mock.calls[0][0];
    const expires = createCall.data.expires as Date;
    const diff = expires.getTime() - Date.now();
    expect(diff).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(diff).toBeLessThanOrEqual(24 * 60 * 60 * 1000);

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});

describe('generatePasswordResetToken', () => {
  it('deletes existing tokens and creates a new one with 1h TTL', async () => {
    prisma.verificationToken.create.mockResolvedValue({
      identifier: 'user@example.com',
      token: 'any',
      expires: new Date(),
    });

    const token = await generatePasswordResetToken('user@example.com');

    expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'user@example.com' },
    });

    const createCall = prisma.verificationToken.create.mock.calls[0][0];
    const expires = createCall.data.expires as Date;
    const diff = expires.getTime() - Date.now();
    expect(diff).toBeGreaterThan(59 * 60 * 1000);
    expect(diff).toBeLessThanOrEqual(60 * 60 * 1000);

    expect(typeof token).toBe('string');
  });
});

describe('verifyToken', () => {
  it('returns true and deletes the token when valid', async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    prisma.verificationToken.findUnique.mockResolvedValue({
      identifier: 'user@example.com',
      token: 'valid-token',
      expires: futureDate,
    });

    const result = await verifyToken('user@example.com', 'valid-token');

    expect(result).toBe(true);
    expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: 'user@example.com', token: 'valid-token' } },
    });
  });

  it('returns false for non-existent token', async () => {
    prisma.verificationToken.findUnique.mockResolvedValue(null);

    const result = await verifyToken('user@example.com', 'bad-token');

    expect(result).toBe(false);
    expect(prisma.verificationToken.delete).not.toHaveBeenCalled();
  });

  it('returns false and deletes expired token', async () => {
    const pastDate = new Date(Date.now() - 60 * 60 * 1000);
    prisma.verificationToken.findUnique.mockResolvedValue({
      identifier: 'user@example.com',
      token: 'expired-token',
      expires: pastDate,
    });

    const result = await verifyToken('user@example.com', 'expired-token');

    expect(result).toBe(false);
    expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: 'user@example.com', token: 'expired-token' } },
    });
  });
});
