"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_NAMESPACE = "medusa";
const DEFAULT_CACHE_TIME = 30; // 30 seconds
const EXPIRY_MODE = "EX"; // "EX" stands for an expiry time in second
class RedisCacheService {
    constructor({ cacheRedisConnection }, options = {}) {
        this.__hooks = {
            onApplicationShutdown: async () => {
                this.redis.disconnect();
            },
        };
        this.redis = cacheRedisConnection;
        this.TTL = options.ttl ?? DEFAULT_CACHE_TIME;
        this.namespace = options.namespace || DEFAULT_NAMESPACE;
    }
    /**
     * Set a key/value pair to the cache.
     * If the ttl is 0 it will act like the value should not be cached at all.
     * @param key
     * @param data
     * @param ttl
     */
    async set(key, data, ttl = this.TTL) {
        if (ttl === 0) {
            return;
        }
        await this.redis.set(this.getCacheKey(key), JSON.stringify(data), EXPIRY_MODE, ttl);
    }
    /**
     * Retrieve a cached value belonging to the given key.
     * @param cacheKey
     */
    async get(cacheKey) {
        cacheKey = this.getCacheKey(cacheKey);
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (err) {
            await this.redis.unlink(cacheKey);
        }
        return null;
    }
    /**
     * Invalidate cache for a specific key. a key can be either a specific key or more global such as "ps:*".
     * @param key
     */
    async invalidate(key) {
        const pattern = this.getCacheKey(key);
        let cursor = "0";
        do {
            const result = await this.redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = result[0];
            const keys = result[1];
            if (keys.length > 0) {
                const deletePipeline = this.redis.pipeline();
                for (const key of keys) {
                    deletePipeline.unlink(key);
                }
                await deletePipeline.exec();
            }
        } while (cursor !== "0");
    }
    /**
     * Returns namespaced cache key
     * @param key
     */
    getCacheKey(key) {
        return this.namespace ? `${this.namespace}:${key}` : key;
    }
}
exports.default = RedisCacheService;
//# sourceMappingURL=redis-cache.js.map