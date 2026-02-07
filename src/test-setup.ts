import { vi } from 'vitest';

// Disable rate limiting in all tests
vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: vi.fn().mockReturnValue(null),
  rateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 99, resetAt: Date.now() + 60000 }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  RATE_LIMITS: {
    auth: { limit: 10, windowMs: 60000 },
    api: { limit: 60, windowMs: 60000 },
    payments: { limit: 5, windowMs: 60000 },
    webhook: { limit: 30, windowMs: 60000 },
  },
}));
