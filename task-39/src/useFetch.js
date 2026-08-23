import { useEffect, useRef, useState, useCallback } from "react";
import { mockFetch, ApiError } from "./mockApi.js";

// Module-level cache shared across every useFetch() call in the app —
// mirrors how libraries like SWR/React Query dedupe requests and share
// cached data between components requesting the same key.
const cache = new Map(); // key -> { data, error, timestamp }
const inFlight = new Map(); // key -> Promise
const subscribers = new Map(); // key -> Set<callback>

const DEFAULT_STALE_TIME = 10_000; // ms before cached data is considered stale

function notify(key) {
  subscribers.get(key)?.forEach((cb) => cb());
}

function subscribe(key, cb) {
  if (!subscribers.has(key)) subscribers.set(key, new Set());
  subscribers.get(key).add(cb);
  return () => subscribers.get(key)?.delete(cb);
}

async function loadKey(key, fetcher) {
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, error: null, timestamp: Date.now() });
      inFlight.delete(key);
      notify(key);
      return data;
    })
    .catch((error) => {
      cache.set(key, { data: cache.get(key)?.data ?? null, error, timestamp: Date.now() });
      inFlight.delete(key);
      notify(key);
      throw error;
    });

  inFlight.set(key, promise);
  return promise;
}

/**
 * useFetch(key, fetcherFactory, options)
 *  - key: cache key (string), or null to skip fetching
 *  - fetcherFactory: () => Promise<data>
 *  - options.staleTime: ms before a cached entry triggers a background revalidation
 *
 * Returns { data, error, isLoading, isValidating, isStale, refetch }
 */
export function useFetch(key, fetcherFactory, options = {}) {
  const { staleTime = DEFAULT_STALE_TIME, enabled = true } = options;
  const fetcherRef = useRef(fetcherFactory);
  fetcherRef.current = fetcherFactory;

  const [, forceRender] = useState(0);
  const entry = key ? cache.get(key) : null;

  const isStale = entry ? Date.now() - entry.timestamp > staleTime : true;
  const [isValidating, setIsValidating] = useState(false);

  const runFetch = useCallback(
    (background = false) => {
      if (!key || !enabled) return Promise.resolve();
      if (!background) setIsValidating(true);
      return loadKey(key, () => fetcherRef.current())
        .catch(() => {}) // errors are surfaced via cache entry
        .finally(() => setIsValidating(false));
    },
    [key, enabled]
  );

  useEffect(() => {
    if (!key || !enabled) return;
    const unsub = subscribe(key, () => forceRender((n) => n + 1));

    const cached = cache.get(key);
    if (!cached) {
      runFetch(false);
    } else if (Date.now() - cached.timestamp > staleTime) {
      runFetch(true); // stale-while-revalidate: show cached data, refresh in background
    }
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return {
    data: entry?.data ?? null,
    error: entry?.error ?? null,
    isLoading: !entry && isValidating,
    isValidating,
    isStale,
    refetch: () => runFetch(false),
  };
}

export function clearCache(key) {
  if (key) {
    cache.delete(key);
    notify(key);
  } else {
    const keys = Array.from(cache.keys());
    cache.clear();
    keys.forEach(notify);
  }
}

export function getCacheSnapshot() {
  return Array.from(cache.entries()).map(([key, v]) => ({
    key,
    hasData: v.data != null,
    hasError: v.error != null,
    age: Date.now() - v.timestamp,
  }));
}

export function fetcherFor(endpoint) {
  return () => mockFetch(endpoint, { latency: [400, 1100] });
}

export { ApiError };
