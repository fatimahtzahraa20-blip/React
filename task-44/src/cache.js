// A general-purpose client-side cache: TTL expiration, LRU eviction once a
// max size is exceeded, and tag-based invalidation (so "invalidate all
// product-related entries" doesn't require enumerating every key).

export class Cache {
  constructor({ maxEntries = 6, defaultTtl = 8000 } = {}) {
    this.maxEntries = maxEntries;
    this.defaultTtl = defaultTtl;
    this.store = new Map(); // key -> { value, expiresAt, tags, lastAccess }
    this.stats = { hits: 0, misses: 0, evictions: 0, invalidations: 0 };
    this.listeners = new Set();
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  _notify() {
    this.listeners.forEach((cb) => cb());
  }

  set(key, value, { ttl = this.defaultTtl, tags = [] } = {}) {
    if (!this.store.has(key) && this.store.size >= this.maxEntries) {
      this._evictLRU();
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      tags,
      lastAccess: Date.now(),
    });
    this._notify();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses += 1;
      this._notify();
      return { hit: false, value: undefined, expired: false };
    }
    const expired = Date.now() > entry.expiresAt;
    if (expired) {
      this.store.delete(key);
      this.stats.misses += 1;
      this._notify();
      return { hit: false, value: undefined, expired: true };
    }
    entry.lastAccess = Date.now();
    this.stats.hits += 1;
    this._notify();
    return { hit: true, value: entry.value, expired: false };
  }

  invalidate(key) {
    if (this.store.delete(key)) {
      this.stats.invalidations += 1;
      this._notify();
    }
  }

  invalidateTag(tag) {
    let count = 0;
    for (const [key, entry] of this.store.entries()) {
      if (entry.tags.includes(tag)) {
        this.store.delete(key);
        count += 1;
      }
    }
    this.stats.invalidations += count;
    this._notify();
    return count;
  }

  clear() {
    this.store.clear();
    this._notify();
  }

  _evictLRU() {
    let oldestKey = null;
    let oldestAccess = Infinity;
    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.store.delete(oldestKey);
      this.stats.evictions += 1;
    }
  }

  snapshot() {
    const now = Date.now();
    return Array.from(this.store.entries()).map(([key, entry]) => ({
      key,
      tags: entry.tags,
      msRemaining: Math.max(0, entry.expiresAt - now),
      expired: now > entry.expiresAt,
    }));
  }
}
