import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;
const date = value => value ? new Date(value).toLocaleDateString() : 'Never';

function App() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setUsers([]); });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    setBusy(true); setError('');
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${session.access_token}` }, signal: controller.signal })
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Unable to load users.'); return body; })
      .then(body => setUsers(body.users))
      .catch(err => { if (!controller.signal.aborted) { setUsers([]); setError(err.message); } })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [session, refresh]);
  async function signIn(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
      if (error) throw error;
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const visible = users.filter(user => `${user.email} ${user.id} ${user.phone}`.toLowerCase().includes(query.toLowerCase()));
  return <main>
    <header><a href="/" className="brand">▦ <span>Task 60</span></a><span className="badge">ADMIN CONSOLE</span>{session && <button onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) setError(error.message); }}>Sign out</button>}</header>
    <section className="intro"><p className="eyebrow">WORKSPACE / USERS</p><h1>User directory<span>.</span></h1><p>One place to view everyone in your Supabase project.</p></section>
    {!supabase ? <section className="panel"><h2>Connect your project</h2><p>Copy .env.example to .env, fill in your Supabase settings and administrator user IDs, then restart the app.</p></section>
      : !session ? <section className="panel login"><h2>Administrator sign-in</h2><p>Use an existing Supabase administrator account.</p><form onSubmit={signIn}><label>Email<input name="email" type="email" defaultValue="fatimah@gmail.com" autoComplete="username" required placeholder="you@example.com"/></label><label>Password<input name="password" type="password" defaultValue="00001111" autoComplete="current-password" required/></label><button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</button></form></section>
      : <><section className="stats"><div><p>Total users</p><strong>{users.length}</strong></div><div><p>Email verified</p><strong>{users.filter(user => user.email_confirmed_at).length}</strong></div><div><p>Access</p><strong className="small">Read only</strong></div></section><section className="panel directory"><div className="toolbar"><h2>All users <span className="count">{users.length}</span></h2><input aria-label="Search users" placeholder="Search email, phone or user ID…" value={query} onChange={event => setQuery(event.target.value)}/><button disabled={busy} onClick={() => setRefresh(value => value + 1)}>{busy ? 'Loading…' : '↻ Refresh'}</button></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Status</th><th>Created</th><th>Last sign-in</th></tr></thead><tbody>{visible.map(user => <tr key={user.id}><td><b>{user.email || user.phone || 'No email'}</b><small>{user.id}</small></td><td><span className={user.email_confirmed_at ? 'status verified' : 'status'}>{user.email_confirmed_at ? 'Verified' : 'Unverified'}</span></td><td>{date(user.created_at)}</td><td>{date(user.last_sign_in_at)}</td></tr>)}</tbody></table></div>{!visible.length && <p className="empty">{busy ? 'Loading your users…' : error ? 'User directory unavailable.' : query ? 'No users match your search.' : 'No users found in this project.'}</p>}<footer>{visible.length} of {users.length} users</footer></section></>}
    {error && <p className="error" role="alert">{error}</p>}
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
