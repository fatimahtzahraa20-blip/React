import React, { useEffect, useRef, useState } from 'react';
import { request, clearResponseCache } from '../api/httpClient';
import { useDedupedRequest } from '../hooks/useDedupedRequest';

export default function DedupDemo() {
  const [burstSize, setBurstSize] = useState(5);
  const [log, setLog] = useState([]);
  const [serverCount, setServerCount] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const { data, loading, error, call, cancel } = useDedupedRequest();
  const handles = useRef(new Set());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; for (const handle of handles.current) handle.cancel(); handles.current.clear(); };
  }, []);
  const note = (message) => { if (mounted.current) setLog((lines) => [...lines.slice(-11), message]); };
  const tracked = (url, options) => {
    const handle = request(url, options);
    handles.current.add(handle);
    handle.promise.then(() => handles.current.delete(handle), () => handles.current.delete(handle));
    return handle;
  };
  const count = async () => {
    const result = await tracked('/api/request-count', { cacheTtlMs: 0 }).promise;
    if (mounted.current) setServerCount(result.requestCount);
    return result.requestCount;
  };
  const run = async (action) => {
    setBusy(true);
    setActionError(null);
    try { await action(); } catch (e) { if (e.name !== 'AbortError' && mounted.current) { setActionError(e.message); note('Error: ' + e.message); } }
    finally { if (mounted.current) setBusy(false); }
  };
  const burst = (dedupe) => run(async () => {
    clearResponseCache();
    const before = await count();
    await Promise.all(Array.from({ length: burstSize }, () => tracked('/api/items', { dedupe, skipCache: true }).promise));
    const after = await count();
    note(burstSize + ' callers, dedup ' + (dedupe ? 'on' : 'off') + ': ' + (after - before) + ' server hits.');
  });
  const cacheDemo = () => run(async () => {
    clearResponseCache();
    await tracked('/api/items').promise;
    const second = tracked('/api/items');
    await second.promise;
    note('Second sequential read from cache: ' + second.fromCache + '. Cache lasts 2 seconds.');
    await count();
  });
  const cancellationDemo = () => run(async () => {
    clearResponseCache();
    const first = tracked('/api/items');
    const second = tracked('/api/items');
    const cancelled = first.promise.catch((e) => e.name);
    first.cancel();
    first.cancel();
    await second.promise;
    note('First caller: ' + await cancelled + '; second caller completed using the shared fetch.');
    await count();
  });
  const load = (q) => call('/api/items?q=' + encodeURIComponent(q) + '&delayMs=' + (q.length < 3 ? 1200 : 100), { skipCache: true });
  const save = (event) => {
    event.preventDefault();
    run(async () => {
      await tracked('/api/items', { method: 'POST', body: { name, sku } }).promise;
      note('Item saved in Supabase. Cached reads invalidated.');
      if (mounted.current) { setName(''); setSku(''); await load(search); }
    });
  };
  return <div>
    <fieldset disabled={busy} style={{ padding: 16, marginBottom: 20 }}>
      <legend>Network experiments</legend>
      <label>Burst size <input type="number" min="1" max="20" value={burstSize} onChange={(e) => setBurstSize(Math.max(1, Math.min(20, Math.trunc(Number(e.target.value)) || 1)))} /></label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
        <button onClick={() => burst(false)}>Burst without dedup</button>
        <button onClick={() => burst(true)}>Burst with dedup</button>
        <button onClick={cacheDemo}>Test cache</button>
        <button onClick={cancellationDemo}>Test shared cancellation</button>
        <button onClick={() => run(async () => { await tracked('/api/reset-count', { method: 'POST' }).promise; await count(); note('Counter reset.'); })}>Reset counter</button>
        <button onClick={() => { clearResponseCache(); note('Cache cleared.'); }}>Clear cache</button>
      </div>
      <p>Server GET /items count: <strong>{serverCount ?? '-'}</strong> {busy && '(running)'}</p>
    </fieldset>
    <section>
      <h2>Search and cancellation</h2>
      <p>Type quickly: short searches take 1.2 seconds; longer searches take 0.1 seconds before the database query. Only the latest search updates this list.</p>
      <label>Search name <input maxLength={120} value={search} onChange={(e) => { setSearch(e.target.value); void load(e.target.value); }} /></label>
      <button onClick={() => void load(search)}>Load / refresh</button>
      <button disabled={!loading} onClick={cancel}>Cancel search</button>
      <p role="status">{loading ? 'Loading...' : error ? 'Request failed' : 'Ready'}{data && ' | Results for: ' + (data.query || '(all items)')}</p>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error.message}</p>}
      {data && <ul>{data.items.map((item) => <li key={item.id}>{item.name} ({item.sku})</li>)}</ul>}
      {data?.items.length === 0 && <p>No matching items.</p>}
    </section>
    <form onSubmit={save}>
      <h2>Add an item to Supabase</h2>
      {actionError && <p role="alert" style={{ color: 'crimson' }}>{actionError}</p>}
      <fieldset disabled={busy}>
        <label>Name <input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} /></label>{' '}
        <label>SKU <input required maxLength={80} value={sku} onChange={(e) => setSku(e.target.value)} /></label>{' '}
        <button type="submit">Save item</button>
      </fieldset>
    </form>
    <h2>Experiment log</h2>
    <div aria-live="polite" style={{ background: '#f3f4f6', padding: 12, minHeight: 70 }}>
      {log.length ? log.map((line, i) => <p key={i}>{line}</p>) : 'Run an experiment to see results.'}
    </div>
  </div>;
}

