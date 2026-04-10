/**
 * In-memory cache service (Redis-compatible interface).
 * Replace Map with ioredis client for production.
 */

interface CacheEntry {
  data: any;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

export const cacheService = {
  async set(key: string, data: any, ttlSeconds: number): Promise<void> {
    store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  async get<T>(key: string): Promise<T | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.data as T;
  },

  async del(key: string): Promise<void> {
    store.delete(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of store.keys()) {
      if (regex.test(key)) store.delete(key);
    }
  },

  async flush(): Promise<void> {
    store.clear();
  },
};

// Cache key helpers
export const CacheKeys = {
  meals: (filters: object) => `meals:${JSON.stringify(filters)}`,
  meal: (id: string) => `meal:${id}`,
  recipes: (filters: object) => `recipes:${JSON.stringify(filters)}`,
  recipe: (id: string) => `recipe:${id}`,
  tracking: (userId: string, date: string) => `tracking:${userId}:${date}`,
  userTracking: (userId: string) => `tracking:${userId}:*`,
};
