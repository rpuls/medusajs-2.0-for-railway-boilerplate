"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_TTL = 30; // seconds
/**
 * Class represents basic, in-memory, cache store.
 */
class InMemoryCacheService {
    constructor(deps, options = {}) {
        this.store = new Map();
        this.timoutRefs = new Map();
        this.TTL = options.ttl ?? DEFAULT_TTL;
    }
    /**
     * Retrieve data from the cache.
     * @param key - cache key
     */
    async get(key) {
        const now = Date.now();
        const record = this.store.get(key);
        const recordExpire = record?.expire ?? Infinity;
        if (!record || recordExpire < now) {
            return null;
        }
        return record.data;
    }
    /**
     * Set data to the cache.
     * @param key - cache key under which the data is stored
     * @param data - data to be stored in the cache
     * @param ttl - expiration time in seconds
     */
    async set(key, data, ttl = this.TTL) {
        if (ttl === 0) {
            return;
        }
        const record = { data, expire: ttl * 1000 + Date.now() };
        const oldRecord = this.store.get(key);
        if (oldRecord) {
            clearTimeout(this.timoutRefs.get(key));
            this.timoutRefs.delete(key);
        }
        const ref = setTimeout(async () => {
            await this.invalidate(key);
        }, ttl * 1000);
        ref.unref();
        this.timoutRefs.set(key, ref);
        this.store.set(key, record);
    }
    /**
     * Delete data from the cache.
     * Could use wildcard (*) matcher e.g. `invalidate("ps:*")` to delete all keys that start with "ps:"
     *
     * @param key - cache key
     */
    async invalidate(key) {
        let keys = [key];
        if (key.includes("*")) {
            const regExp = new RegExp(key.replace("*", ".*"));
            keys = Array.from(this.store.keys()).filter((k) => k.match(regExp));
        }
        keys.forEach((key) => {
            const timeoutRef = this.timoutRefs.get(key);
            if (timeoutRef) {
                clearTimeout(timeoutRef);
                this.timoutRefs.delete(key);
            }
            this.store.delete(key);
        });
    }
    /**
     * Delete the entire cache.
     */
    async clear() {
        this.timoutRefs.forEach((ref) => clearTimeout(ref));
        this.timoutRefs.clear();
        this.store.clear();
    }
}
exports.default = InMemoryCacheService;
//# sourceMappingURL=inmemory-cache.js.map