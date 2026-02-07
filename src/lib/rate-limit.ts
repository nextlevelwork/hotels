/**
 * In-memory rate limiter using sliding window.
 * For production with multiple instances, replace with Redis-based solution.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now - entry.lastRefill > windowMs * 2) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Maximum requests per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const { limit, windowMs } = config;
  const now = Date.now();

  cleanup(windowMs);

  const entry = store.get(key);

  if (!entry) {
    store.set(key, { tokens: limit - 1, lastRefill: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refillRate = limit / windowMs;
  const refilled = Math.min(limit, entry.tokens + elapsed * refillRate);

  if (refilled < 1) {
    const resetAt = entry.lastRefill + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.tokens = refilled - 1;
  entry.lastRefill = now;

  return { allowed: true, remaining: Math.floor(entry.tokens), resetAt: now + windowMs };
}

/** Pre-configured limiters for common use cases */
export const RATE_LIMITS = {
  /** Auth endpoints: 10 requests per minute */
  auth: { limit: 10, windowMs: 60 * 1000 },
  /** General API: 60 requests per minute */
  api: { limit: 60, windowMs: 60 * 1000 },
  /** Payment endpoints: 5 requests per minute */
  payments: { limit: 5, windowMs: 60 * 1000 },
  /** Webhooks: 30 requests per minute (YooKassa sends retries) */
  webhook: { limit: 30, windowMs: 60 * 1000 },
} as const;

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Apply rate limit and return 429 Response if exceeded.
 * Returns null if request is allowed.
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig,
  prefix = 'api'
): Response | null {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const result = rateLimit(key, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: 'Слишком много запросов. Попробуйте позже.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}
