
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttlMs: number = 300000): void { // 5 minute default
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { data, expiry });
    console.log(`💾 Cache set: ${key} (TTL: ${ttlMs}ms)`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      console.log(`💾 Cache expired: ${key}`);
      return null;
    }
    
    console.log(`💾 Cache hit: ${key}`);
    return entry.data;
  }

  clear(prefix?: string): void {
    if (prefix) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(prefix));
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`💾 Cache cleared with prefix: ${prefix} (${keysToDelete.length} entries)`);
    } else {
      this.cache.clear();
      console.log(`💾 Cache cleared completely`);
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cacheService = new CacheService();
