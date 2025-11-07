import Redis from "ioredis";

// If REDIS_URL is provided, use a real Redis client. Otherwise provide a
// lightweight in-memory mock implementing the methods used across the app
// (get, set, setex, del, ping, keys). This allows local development without
// installing Redis (not suitable for production).

const redisUrl = process.env.REDIS_URL;

let client: any;

if (redisUrl) {
  const redis = new Redis(redisUrl);

  redis
    .on("connect", () => console.log("✅ Connected to Redis"))
    .on("error", (err) => console.error("❌ Redis error:", err));

  client = redis;
} else {
  console.warn(
    "⚠️  REDIS_URL not set — using in-memory Redis mock (sessions/caching will be ephemeral)."
  );

  type ExpiringValue = { value: string; expiresAt?: number };

  const store = new Map<string, ExpiringValue>();

  const cleanupIfExpired = (key: string) => {
    const item = store.get(key);
    if (!item) return false;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      store.delete(key);
      return false;
    }
    return true;
  };

  const mock = {
    async get(key: string) {
      try {
        if (!cleanupIfExpired(key)) return null;
        const v = store.get(key);
        return v ? v.value : null;
      } catch (err) {
        return null;
      }
    },
    // supports either set(key, value) or set(key, value, 'EX', ttl)
    async set(key: string, value: string, ...args: any[]) {
      let expiresAt: number | undefined;
      if (args && args.length >= 2) {
        // look for ['EX', ttl]
        const idx = args.findIndex((a) => (typeof a === "string" ? a.toUpperCase() === "EX" : false));
        if (idx !== -1 && typeof args[idx + 1] === "number") {
          expiresAt = Date.now() + args[idx + 1] * 1000;
        }
      }
      store.set(key, { value, expiresAt });
      return 'OK';
    },
    async setex(key: string, ttl: number, value: string) {
      const expiresAt = Date.now() + ttl * 1000;
      store.set(key, { value, expiresAt });
      return 'OK';
    },
    async del(key: string | string[]) {
      if (Array.isArray(key)) {
        let removed = 0;
        for (const k of key) if (store.delete(k)) removed++;
        return removed;
      }
      return store.delete(key) ? 1 : 0;
    },
    async ping() {
      return 'PONG';
    },
    // simple pattern support for '*' at the end
    async keys(pattern = '*') {
      if (pattern === '*') return Array.from(store.keys());
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return Array.from(store.keys()).filter((k) => k.startsWith(prefix));
      }
      return Array.from(store.keys()).filter((k) => k === pattern);
    },
  } as const;

  client = mock;
}

export default client;
