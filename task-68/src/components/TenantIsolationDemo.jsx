import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export default function TenantIsolationDemo() {
  if (!url || !key) return <p role="alert">Configure the VITE_SUPABASE variables in .env and restart Vite. See README.md.</p>;
  return <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    <TenantPanel label="Session A" /><TenantPanel label="Session B" />
  </div>;
}
function TenantPanel({ label }) {
  // Separate in-memory sessions let two users demonstrate isolation in one browser.
  const client = useMemo(() => createClient(url, key, {
    auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: true },
  }), []);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    client.auth.startAutoRefresh();
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, value) => setSession(value));
    return () => { subscription.unsubscribe(); client.auth.stopAutoRefresh(); };
  }, [client]);
  useEffect(() => {
    let active = true;
    setTenants([]); setTenantId(''); setItems([]);
    if (session?.user.id) {
      client.from('tenants').select('id,name').order('name').then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else { setTenants(data); setTenantId(data[0]?.id || ''); }
      });
    }
    return () => { active = false; };
  }, [client, session?.user.id]);
  useEffect(() => {
    const controller = new AbortController();
    setItems([]);
    if (session && tenantId) {
      request('', {}, controller.signal).then(setItems).catch(e => {
        if (e.name !== 'AbortError') setError(e.message);
      });
    }
    return () => controller.abort();
  }, [session?.access_token, tenantId, revision]);
  async function request(path = '', options = {}, signal) {
    const response = await fetch('/api/items' + path, {
      ...options, signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token, 'x-tenant-id': tenantId },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
    return data;
  }
  async function perform(action) {
    setBusy(true); setError('');
    try { await action(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function login(e) {
    e.preventDefault();
    perform(async () => {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setPassword('');
    });
  }
  function add(e) {
    e.preventDefault();
    perform(async () => {
      await request('', { method: 'POST', body: JSON.stringify({ name, sku }) });
      setName(''); setSku(''); setRevision(n => n + 1);
    });
  }
  return <section style={{ border: '1px solid #ccc', borderRadius: 12, padding: 20, width: 380 }}>
    <h2>{label}</h2>
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    {!session ? <form onSubmit={login} style={{ display: 'grid', gap: 10 }}>
      <label>Email <input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password <input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button disabled={busy}>Sign in</button>
    </form> : <>
      <p>{session.user.email}</p>
      <button disabled={busy} onClick={() => perform(async () => {
        const { error } = await client.auth.signOut({ scope: 'local' });
        if (error) throw error;
        setItems([]); setTenants([]); setTenantId('');
      })}>Sign out</button>
      <p><label>Tenant <select disabled={busy} value={tenantId} onChange={e => { setError(''); setTenantId(e.target.value); }}>
        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select></label></p>
      {tenantId ? <>
        <small>{tenantId}</small>
        <form onSubmit={add} style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          <label>Name <input required maxLength={200} value={name} onChange={e => setName(e.target.value)} /></label>
          <label>SKU <input required maxLength={100} value={sku} onChange={e => setSku(e.target.value)} /></label>
          <button disabled={busy}>Add item</button>
        </form>
        <button disabled={busy} onClick={() => { setError(''); setRevision(n => n + 1); }}>Refresh</button>
        <ul>{items.map(item => <li key={item.id}>{item.name} ({item.sku}){' '}
          <button disabled={busy} onClick={() => perform(async () => {
            await request('/' + item.id, { method: 'DELETE' });
            setRevision(n => n + 1);
          })}>Delete</button>
        </li>)}</ul>
        {!items.length && <p>No items loaded for this tenant.</p>}
      </> : <p>No tenant membership. Ask the project administrator to provision access using the README.</p>}
    </>}
  </section>;
}
