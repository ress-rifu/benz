import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Lazy-load Redis - only initialize if REDIS_URL is configured
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    // Suppress connection errors when Redis is unavailable
    globalForRedis.redis.on("error", () => {
      // Silently handle connection errors
    });
  }

  return globalForRedis.redis;
}

export const redis = getRedis();

export const CACHE_KEYS = {
  INVENTORY: "inventory:all",
  INVENTORY_ITEM: (id: string) => `inventory:${id}`,
  SERVICE_CATEGORIES: "service:categories",
  SERVICES: "services:all",
  SERVICE: (id: string) => `service:${id}`,
  PART_CATEGORIES: "part:categories",
  PART_BRANDS: "part:brands",
  PARTS: "parts:all",
  PART: (id: string) => `part:${id}`,
  CUSTOMERS: "customers:all",
  CUSTOMER: (id: string) => `customer:${id}`,
  INVOICE_SETTINGS: "invoice:settings",
  DASHBOARD_SUMMARY: "dashboard:summary",
  USER_ROLE: (userId: string) => `user:role:${userId}`,
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
} as const;


