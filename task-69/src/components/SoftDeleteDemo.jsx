import React, { useEffect, useState } from 'react';
const headers = { 'Content-Type': 'application/json', 'x-tenant-id': 'demo-tenant', 'x-user-id': 'demo-user' };
async function request(path, options = {}) {
  const res = await fetch('/api' + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}
async function loadPages(path) {
  const rows = [];
  for (let offset = 0; ; offset += 100) {
    const page = await request(path + '?limit=100&offset=' + offset);
    rows.push(...page);
    if (page.length < 100) return rows;
  }
}
export default function SoftDeleteDemo() {
  const [items, setItems] = useState([]);
  const [trash, setTrash] = useState([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');
  const refresh = async () => {
    const [live, deleted] = await Promise.all([loadPages('/items'), loadPages('/items/trash')]);
    setItems(live); setTrash(deleted);
  };
  useEffect(() => {
    refresh().catch(e => setError(e.message)).finally(() => setBusy(false));
  }, []);
  const act = async (operation) => {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); await refresh(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const addItem = e => {
    e.preventDefault();
    act(async () => {
      await request('/items', { method: 'POST', body: JSON.stringify({ name, sku }) });
      setName(''); setSku(''); setNotice('Item created.');
    });
  };
  const changeState = (id, restore) => act(async () => {
    await request('/items/' + id + (restore ? '/restore' : ''), { method: restore ? 'POST' : 'DELETE' });
    setNotice(restore ? 'Item restored.' : 'Item moved to trash.');
  });
  return <section aria-busy={busy}>
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    <p role="status">{busy ? 'Loading…' : notice}</p>
    <button disabled={busy} onClick={() => act(async () => {})}>Refresh</button>
    <form onSubmit={addItem} style={{ display: 'flex', gap: 12, margin: '20px 0', flexWrap: 'wrap' }}>
      <label>Name <input required maxLength={200} value={name} onChange={e => setName(e.target.value)} /></label>
      <label>SKU <input required maxLength={100} value={sku} onChange={e => setSku(e.target.value)} /></label>
      <button disabled={busy || !name.trim() || !sku.trim()}>Add item</button>
    </form>
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {[[false, items], [true, trash]].map(([deleted, rows]) => <section key={String(deleted)}
        style={{ border: '1px solid #ddd', borderRadius: 12, padding: 20, flex: '1 1 320px' }}>
        <h2>{deleted ? 'Trash' : 'Live items'} ({rows.length})</h2>
        {!rows.length && !busy && <p>{deleted ? 'Trash is empty.' : 'No live items.'}</p>}
        <ul style={{ paddingLeft: 20 }}>
          {rows.map(item => <li key={item.id} style={{ marginBottom: 16 }}>
            <strong>{item.name}</strong> — {item.sku}{' '}
            <button disabled={busy} onClick={() => changeState(item.id, deleted)}>{deleted ? 'Restore' : 'Soft-delete'}</button>
            {deleted && <div><small>Deleted {new Date(item.deleted_at).toLocaleString()} by {item.deleted_by || 'unknown actor'}</small></div>}
          </li>)}
        </ul>
      </section>)}
    </div>
  </section>;
}
