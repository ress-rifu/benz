import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Redis disabled - returns null to skip caching
function getRedis(): Redis | null {
  // Disabled: return null to skip all caching
  return null;
}

export const redis = getRedis();

export const CACHE_KEYS = {
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


