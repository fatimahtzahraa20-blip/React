const inFlight = new Map();
const responseCache = new Map();
const latest = new Map();
let cacheEpoch = 0;
const abortError = () => new DOMException('Request cancelled', 'AbortError');

// JSON requests only. Include headers in identity to isolate authorization contexts.
export function request(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const read = method === 'GET';
  const dedupe = read && options.dedupe !== false;
  const ttl = options.cacheTtlMs ?? 2000;
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const key = JSON.stringify([method, url, [...headers.entries()]]);
  const flightKey = JSON.stringify([key, ttl]);
  if (read && !options.skipCache && ttl > 0) {
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > Date.now() && Date.now() - cached.createdAt < ttl) {
      let cancelled = false;
      return { promise: Promise.resolve().then(() => { if (cancelled) throw abortError(); return cached.data; }), cancel: () => { cancelled = true; }, deduped: false, fromCache: true };
    }
    responseCache.delete(key);
  }
  let entry = dedupe ? inFlight.get(flightKey) : undefined;
  const shared = Boolean(entry);
  if (!entry) {
    entry = { controller: new AbortController(), subscribers: 0, settled: false };
    const epoch = cacheEpoch;
    if (read) latest.set(key, entry);
    if (dedupe) inFlight.set(flightKey, entry);
    entry.promise = Promise.resolve().then(() => fetch(url, {
      method, headers, body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: entry.controller.signal, cache: 'no-store',
    })).then(async (res) => {
      const text = await res.text();
      let data = text || null;
      try { data = JSON.parse(text); } catch { /* Empty/text responses are allowed. */ }
      if (!res.ok) throw Object.assign(new Error(data?.message || 'HTTP ' + res.status), { status: res.status, body: data });
      if (entry.controller.signal.aborted) throw abortError();
      if (!read) clearResponseCache();
      if (read && ttl > 0 && epoch === cacheEpoch && latest.get(key) === entry) {
        const now = Date.now();
        for (const [k, value] of responseCache) if (value.expiresAt <= now) responseCache.delete(k);
        responseCache.delete(key);
        responseCache.set(key, { data, createdAt: now, expiresAt: now + ttl });
        if (responseCache.size > 100) responseCache.delete(responseCache.keys().next().value);
      }
      return data;
    }).finally(() => {
      entry.settled = true;
      if (inFlight.get(flightKey) === entry) inFlight.delete(flightKey);
      if (latest.get(key) === entry) latest.delete(key);
    });
  }
  entry.subscribers++;
  let done = false;
  let rejectSubscriber;
  const promise = new Promise((resolve, reject) => {
    rejectSubscriber = reject;
    entry.promise.then((data) => { if (!done) { done = true; resolve(data); } }, (error) => { if (!done) { done = true; reject(error); } });
  });
  const cancel = () => {
    if (done) return;
    done = true;
    rejectSubscriber(abortError());
    entry.subscribers--;
    if (!entry.settled && entry.subscribers === 0) {
      entry.controller.abort();
      if (inFlight.get(flightKey) === entry) inFlight.delete(flightKey);
    }
  };
  return { promise, cancel, deduped: shared, fromCache: false };
}

// Detach old flights so reads after a write cannot join pre-write work.
export function clearResponseCache() {
  cacheEpoch++;
  responseCache.clear();
  inFlight.clear();
  latest.clear();
}
export function _debugInspect() {
  return { inFlightKeys: [...inFlight.keys()], cachedKeys: [...responseCache.keys()] };
}

