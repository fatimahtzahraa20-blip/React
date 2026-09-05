# 32 — Client-Side Cache System

A standalone, framework-agnostic `Cache` class (`src/cache.js`) demonstrating the core mechanics of a client-side cache, wired into a small product catalog UI.

## Features demonstrated
- **TTL expiration**: each entry has a time-to-live; the inspector panel shows a live countdown per key and entries return a miss once expired.
- **LRU eviction**: the cache is capped at 4 entries (`maxEntries: 4`) — load more distinct keys than that and the least-recently-accessed entry is evicted automatically.
- **Tag-based invalidation**: entries are tagged (e.g. `products`, `category:electronics`); "Invalidate all products tag" clears every matching entry without needing to know individual keys — useful for e.g. "any mutation to any product should invalidate all product list views."
- **Write-then-invalidate pattern**: adjusting a product's stock count performs the mutation, then explicitly invalidates that category's cache entry so the next read is forced back to the network rather than serving stale stock numbers — a common and important real-world cache-invalidation strategy.
- **Cache statistics**: hit/miss/eviction/invalidation counters update live via a simple pub/sub subscription on the cache instance.
- **Cache-first reads**: "Reload" checks the cache before hitting the network, and the UI clearly labels whether data was `served from cache` or `served from network`.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```
