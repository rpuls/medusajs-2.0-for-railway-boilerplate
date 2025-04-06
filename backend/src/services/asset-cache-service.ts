import { Service } from "medusa-core-utils";

type CacheOptions = {
  ttl?: number; // Time to live in seconds
};

/**
 * Service for caching frequently accessed digital assets
 * This is a simple in-memory implementation.
 * For production, consider using Redis or a dedicated caching service.
 */
class AssetCacheService extends Service {
  protected cache: Map<string, { data: any; expiresAt: number }>;
  protected defaultTtl: number; // Default TTL in seconds
  
  constructor({ logger }, options) {
    super();
    
    this.cache = new Map();
    this.defaultTtl = options.ttl || 3600; // Default 1 hour TTL
    
    // Periodically clean up expired cache entries
    setInterval(() => this.cleanupExpiredEntries(), 60000); // Run every minute
  }
  
  /**
   * Set an item in the cache
   */
  set(key: string, value: any, options?: CacheOptions): void {
    const ttl = options?.ttl || this.defaultTtl;
    const expiresAt = Date.now() + (ttl * 1000);
    
    this.cache.set(key, {
      data: value,
      expiresAt
    });
  }
  
  /**
   * Get an item from the cache
   * Returns undefined if key doesn't exist or is expired
   */
  get(key: string): any | undefined {
    const item = this.cache.get(key);
    
    // If item doesn't exist or is expired
    if (!item || item.expiresAt < Date.now()) {
      if (item) {
        // Clean up expired item
        this.cache.delete(key);
      }
      return undefined;
    }
    
    return item.data;
  }
  
  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    return !!item && item.expiresAt >= Date.now();
  }
  
  /**
   * Remove an item from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get or set a value with a callback function
   * If the key exists, returns the cached value
   * If not, calls the callback function, caches the result, and returns it
   */
  async getOrSet(key: string, callback: () => Promise<any>, options?: CacheOptions): Promise<any> {
    // Try to get from cache first
    const cachedValue = this.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // Not in cache, get fresh value
    const value = await callback();
    
    // Cache the value
    this.set(key, value, options);
    
    return value;
  }
  
  /**
   * Remove expired entries from the cache
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
}

export default AssetCacheService; 