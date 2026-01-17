interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// In-memory rate limiting fallback (works without Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  // Try Redis first if available
  if (process.env.REDIS_URL) {
    try {
      const { redis } = await import("./client");
      if (!redis) throw new Error("Redis not available");

      const key = `rate_limit:${identifier}`;
      const windowSec = Math.floor(windowMs / 1000);

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      const ttl = await redis.ttl(key);
      const reset = Date.now() + ttl * 1000;

      return {
        success: current <= limit,
        remaining: Math.max(0, limit - current),
        reset,
      };
    } catch {
      // Fall through to in-memory rate limiting
    }
  }

  // In-memory fallback (no Redis required)
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  record.count++;
  return {
    success: record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    reset: record.resetAt,
  };
}

