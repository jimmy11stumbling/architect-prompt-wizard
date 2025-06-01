
// Advanced caching system for high-performance data access
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 10000; // Maximum cache entries
  private defaultTTL: number = 300000; // 5 minutes default TTL
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodic cleanup of expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hitCount: 0
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count for LRU tracking
    entry.hitCount++;
    entry.timestamp = Date.now(); // Update access time
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    let lowestHitCount = Infinity;

    // Find least recently used entry with lowest hit count
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hitCount < lowestHitCount || 
          (entry.hitCount === lowestHitCount && entry.timestamp < oldestTime)) {
        oldestKey = key;
        oldestTime = entry.timestamp;
        lowestHitCount = entry.hitCount;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  getStats() {
    const now = Date.now();
    let totalHits = 0;
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      totalHits += entry.hitCount;
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      expiredEntries: expiredCount,
      utilization: (this.cache.size / this.maxSize) * 100
    };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
