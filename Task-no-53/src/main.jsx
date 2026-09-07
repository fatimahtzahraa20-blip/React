import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Zap, Database, Activity, Settings, LayoutGrid, ArrowUpRight, ArrowRight, Plus, ChevronRight, Terminal, GitBranch, BookOpen, RefreshCw, Download, Search, LogOut, Copy } from 'lucide-react';
import { readConfig, makeClient, saveConfig, fields, statusText, stats, canRetry } from './lib';
import { Dialog, ConnectionForm, LoginForm, InsertForm, Flow, SetupGuide, EventDetail } from './components';
import handlerCode from '../supabase/functions/send-insert-email/handler.js?raw';
import './style.css';
function App() {
  const [config, setConfig] = useState(readConfig);
  const client = useMemo(() => makeClient(config), [config]);
  const [session, setSession] = useState(null), [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState('Overview'), [modal, setModal] = useState(null);
  const [rows, setRows] = useState([]), [query, setQuery] = useState(''), [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false), [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState(''), [page, setPage] = useState(0), [lastSync, setLastSync] = useState(null);
  const [busy, setBusy] = useState(false), [actionError, setActionError] = useState('');
  const toastTimer = useRef(), generation = useRef(0), fetching = useRef(false);
  const operator = session?.user?.app_metadata?.role === 'operator';
  const notify = useCallback(message => { clearTimeout(toastTimer.current); setToast(message); toastTimer.current = setTimeout(() => setToast(''), 5000); }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    setSession(null); setAuthReady(false); setRows([]); setLoadError(''); setLastSync(null);
    if (!client) { setAuthReady(true); return; }
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => { if (active) { setSession(next); setAuthReady(true); } });
    client.auth.getSession().then(({ data, error }) => { if (active) { if (error) setLoadError(error.message); setSession(data?.session || null); setAuthReady(true); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, [client]);
  const refresh = useCallback(async (quiet = false) => {
    if (!client || !operator || fetching.current) return;
    fetching.current = true;
    const current = generation.current;
    if (!quiet) setLoading(true);
    try {
      const { data, error } = await client.from('contacts').select(fields).order('created_at', { ascending: false }).limit(500).abortSignal(AbortSignal.timeout(15000));
      if (current !== generation.current) return;
      if (error) throw error;
      setRows(data); setLoadError(''); setLastSync(new Date());
    } catch (error) { if (current === generation.current) setLoadError(error.message || 'Could not load contacts. Check your connection.'); }
    finally { if (current === generation.current) { fetching.current = false; setLoading(false); } }
  }, [client, operator]);
  useEffect(() => {
    generation.current++; fetching.current = false; setRows([]); setLastSync(null); setLoading(false);
    refresh();
    const timer = setInterval(() => { if (document.visibilityState === 'visible') refresh(true); }, 5000);
    const onFocus = () => refresh(true);
    window.addEventListener('focus', onFocus);
    return () => { generation.current++; fetching.current = false; clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [refresh, session?.user?.id]);
  useEffect(() => { setPage(0); }, [query, filter, tab]);
  useEffect(() => { setActionError(''); }, [modal]);
  const selected = typeof modal === 'object' && modal ? rows.find(row => row.id === modal.id) || modal : null;
  const metrics = stats(rows);
  const matching = rows.filter(row => `${row.name} ${row.email} ${row.id}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || row.status === filter));
  const maxPage = Math.max(0, Math.ceil(matching.length / 10) - 1), currentPage = Math.min(page, maxPage);
  const visible = tab === 'Overview' ? rows.slice(0, 5) : matching.slice(currentPage * 10, currentPage * 10 + 10);
  const state = !client ? 'Not connected' : !authReady ? 'Checking session' : !session ? 'Sign in required' : !operator ? 'Operator access required' : loadError ? 'Connection error' : lastSync ? 'Live database' : 'Connecting';
  const openInsert = () => setModal(!client ? 'connection' : !session ? 'login' : !operator ? 'setup' : 'insert');
  async function insert(values) {
    const { error } = await client.from('contacts').insert(values);
    if (error) throw error;
    setModal(null); notify('Contact saved. The database trigger has queued the welcome email.'); await refresh();
  }
  async function retry(row) {
    setBusy(true); setActionError('');
    try {
      const { error } = await client.rpc('retry_contact_email', { contact_id: row.id });
      if (error) throw error;
      notify('Email requeued. Its status will update automatically.'); await refresh();
    } catch (error) { setActionError(error.message); }
    finally { setBusy(false); }
  }
  async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) { notify(error.message); return; }
    setRows([]); setModal(null); notify('Signed out.');
  }
  async function connect(next) {
    if (client) await client.auth.signOut({ scope: 'local' });
    saveConfig(next); setConfig(next); setModal('login'); notify('Project connected. Sign in with your operator account.');
  }
  async function copyCode() { try { await navigator.clipboard.writeText(handlerCode); notify('Complete function handler copied.'); } catch { notify('Clipboard unavailable. Select the code to copy it.'); } }
  function exportCsv() {
    const cell = value => { let s = String(value ?? ''); if (/^[=+@\-\t\r]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
    const columns = ['id', 'name', 'email', 'status', 'attempts', 'duration_ms', 'created_at', 'email_id', 'last_error'];
    const csv = [columns.join(','), ...matching.map(row => columns.map(key => cell(row[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'relay-contacts.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="shell">
    <aside><a className="brand" href="#" onClick={() => setTab('Overview')}><Zap fill="currentColor"/>relay<span>.</span></a>
      <button className="workspace" onClick={() => setModal('connection')}><b>R</b><span>Relay workspace<small>{client ? 'Supabase project' : 'Connect a project'}</small></span><span>⌄</span></button>
      <label className="nav-label">WORKSPACE</label><nav>{[[LayoutGrid, 'Overview'], [Zap, 'Edge Functions'], [Database, 'Database'], [Activity, 'Activity'], [Settings, 'Settings']].map(([Icon, name]) => <button key={name} className={(name === 'Overview' && tab === 'Overview') || (name === 'Edge Functions' && tab === 'Code') || name === tab || (name === 'Activity' && tab === 'Logs') ? 'active' : ''} onClick={() => name === 'Settings' ? setModal('connection') : setTab(name === 'Activity' ? 'Logs' : name === 'Edge Functions' ? 'Code' : name)}><Icon size={18}/><span>{name}</span>{name === 'Edge Functions' && <em>1</em>}</button>)}</nav>
      <div className="bottom"><div className="help"><div>✧</div><b>Small functions. Big ideas.</b><p>Bring your backend to life with a little less overhead.</p><button className="plain" onClick={() => setModal('setup')}>Explore the setup guide <ArrowUpRight size={13}/></button></div><button onClick={() => setModal('setup')}><BookOpen size={16}/>Documentation<ArrowUpRight size={13}/></button><button onClick={() => setModal('setup')}>ⓘ Help & support</button><div className="profile"><span className="avatar">{session?.user?.email?.slice(0, 2).toUpperCase() || 'R'}</span><div className="account-name">{session?.user?.email || 'Your account'}<small>{operator ? 'Operator' : 'Not signed in'}</small></div><button className="plain" aria-label={session ? 'Sign out' : 'Sign in'} onClick={() => session ? signOut() : setModal(client ? 'login' : 'connection')}>{session ? <LogOut size={16}/> : <ChevronRight size={16}/>}</button></div></div>
    </aside>
    <div className="main-shell"><header><span>Workspace <ChevronRight size={13}/><b>Edge Functions</b></span><span><span className="env">● {state}</span><a href="https://supabase.com/docs/guides/functions" target="_blank" rel="noreferrer">Docs ↗</a><button className="account-button" onClick={() => setModal(client ? 'login' : 'connection')} aria-label="Account"><span className="avatar">{session ? 'ON' : 'R'}</span></button></span></header>
      <main><div className="breadcrumbs">Edge Functions <span>/</span> send-insert-email</div><div className="title"><div><h1>Edge Functions <span>LIVE READY</span></h1><p>Your backend logic, running closer to your users.</p></div><button className="primary" onClick={() => setModal('setup')}><Settings size={15}/>Configure function</button></div>
        {(!client || !session || !operator) && <div className="connection-banner"><div><b>{!client ? 'Connect your Supabase project' : !session ? 'Sign in to your workspace' : 'This account needs operator access'}</b><p>{!client ? 'Add your project URL and public key to start using real contacts and emails.' : !session ? 'Use the operator account from your Supabase project.' : 'Follow the setup guide to grant this account the operator role, then sign in again.'}</p></div><button className="secondary" onClick={() => setModal(!client ? 'connection' : !session ? 'login' : 'setup')}>{!client ? 'Connect project' : !session ? 'Sign in' : 'View setup'}<ArrowRight size={14}/></button></div>}
        {loadError && <div className="error-banner" role="alert"><b>Could not sync your database</b><p>{loadError}</p><button className="secondary" onClick={() => refresh()}>Try again</button> <button className="secondary" onClick={() => setModal('setup')}>Setup guide</button></div>}
        <section className="function"><div className="function-top"><span className="function-icon"><Zap size={25}/></span><div><h2>send-insert-email <span className="badge">● {state}</span></h2><p>Turn a new database record into a warm welcome.</p></div><button className="more" aria-label="Function settings" onClick={() => setModal('setup')}><Settings size={18}/></button></div><div className="metadata"><span><Terminal size={13}/>Deno / JavaScript</span><span><GitBranch size={13}/>Database trigger</span><span>· Resend email</span><button onClick={() => setModal('connection')}>Connection settings <ArrowUpRight size={12}/></button></div></section>
        <div className="tabs">{['Overview', 'Code', 'Logs', 'Database'].map(name => <button className={tab === name ? 'selected' : ''} onClick={() => setTab(name)} key={name}>{name}{name === 'Logs' && <small>{rows.length}</small>}</button>)}<span>● Deno runtime</span></div>
        {tab === 'Overview' && <><div className="intro"><h2>A little automation. A better first impression.</h2><p>Every new record kicks off an email. Here’s how it comes together.</p></div><Flow/><div className="test"><Terminal size={22}/><div><h3>See it in action</h3><p>Insert a contact. A welcome email will be sent to their email address.</p></div><button className="secondary" onClick={openInsert}><Plus size={14}/>Insert record<ArrowRight size={14}/></button></div><div className="metrics">{[['Contacts', metrics.total, 'real records', 'Latest 500 contacts'], ['Acceptance rate', metrics.rate, 'provider', 'Accepted / completed attempts'], ['Avg. execution time', metrics.duration, 'measured', 'Completed contacts in this view']].map(([label, value, sub, desc]) => <div key={label}><span>{label}<Activity size={13}/></span><strong>{value}<small>{sub}</small></strong><p>{desc}</p></div>)}</div></>}
        {tab === 'Code' ? <section className="code"><div className="activity-head"><div><h2>send-insert-email / handler.js</h2><p>The actual deployed handler. Secrets are read from the server environment.</p></div><button onClick={copyCode}><Copy size={14}/>Copy code</button></div><pre>{handlerCode}</pre><button className="secondary" onClick={() => setModal('setup')}>Deployment guide<ArrowUpRight size={13}/></button></section> : <section className="activity"><div className="activity-head"><div><h2>{tab === 'Database' ? 'Contact records' : 'Recent activity'} <small>{rows.length}</small></h2><p>Persistent database records. Accepted means Resend accepted the email, not confirmed delivery.</p></div><div className="toolbar"><button disabled={!operator || loading} onClick={() => refresh()} aria-label="Refresh records"><RefreshCw size={14} className={loading ? 'spin' : ''}/></button>{tab === 'Overview' ? <button onClick={() => setTab('Logs')}>View all logs<ArrowRight size={13}/></button> : <><button onClick={exportCsv} disabled={!matching.length}><Download size={14}/>Export</button><button onClick={openInsert}><Plus size={14}/>Insert</button></>}</div></div>
          {tab !== 'Overview' && <div className="filters"><label className="search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email or event ID" aria-label="Search records"/></label><select aria-label="Filter status" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All statuses</option>{Object.entries(statusText).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>}
          <div className="table-wrap"><table><thead><tr>{['STATUS', tab === 'Database' ? 'CONTACT' : 'EVENT', 'RECIPIENT', 'EXECUTION', 'CREATED', ''].map((s, i) => <th key={i}>{s}</th>)}</tr></thead><tbody>{visible.map(row => <tr key={row.id} onClick={() => setModal(row)}><td><span className={'badge status-' + row.status}>{statusText[row.status]}</span></td><td><span className="event"><Database size={12}/>{tab === 'Database' ? row.name : 'INSERT'}<code>{row.id.slice(0, 8)}</code></span></td><td>{row.email}</td><td>{row.duration_ms == null ? '—' : `${row.duration_ms} ms`}</td><td>{new Date(row.created_at).toLocaleString()}</td><td><button aria-label={'View event for ' + row.email} onClick={() => setModal(row)}><ChevronRight size={14}/></button></td></tr>)}</tbody></table>{!visible.length && <div className="empty"><Database size={24}/><h3>{loading ? 'Loading your records…' : query || filter !== 'all' ? 'No matching records' : 'No contacts yet'}</h3><p>{operator ? 'Insert a contact to start the email automation.' : 'Connect and sign in to load your real database records.'}</p><button className="secondary" onClick={openInsert}>{operator ? 'Insert first record' : 'Get connected'}<ArrowRight size={13}/></button></div>}</div>
          <div className="table-bottom"><span>{lastSync ? `Synced ${lastSync.toLocaleTimeString()} · refreshes every 5s` : 'Waiting for a database connection'}</span>{tab !== 'Overview' ? <div className="pagination"><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><span>{currentPage + 1} / {maxPage + 1}</span><button disabled={currentPage >= maxPage} onClick={() => setPage(currentPage + 1)}>Next</button></div> : <span>Powered by Supabase & Resend ↗</span>}</div></section>}
        <footer><span><Zap size={12}/>Built for the moments that matter.</span><span>Edge Functions · Task 63</span></footer>
      </main>
    </div>
    {modal && <Dialog onClose={() => { if (!busy) setModal(null); }}><>{modal === 'connection' ? <ConnectionForm config={config} onConnect={connect}/> : modal === 'login' ? <LoginForm client={client} session={session} onSignOut={signOut} onConnect={() => setModal('connection')} onSuccess={() => { setModal(null); notify('Signed in successfully.'); }}/> : modal === 'insert' ? <InsertForm onInsert={insert}/> : selected ? <EventDetail record={selected} onRetry={() => retry(selected)} retryAllowed={canRetry(selected)} busy={busy} error={actionError}/> : <SetupGuide onConnect={() => setModal('connection')}/>}</></Dialog>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
