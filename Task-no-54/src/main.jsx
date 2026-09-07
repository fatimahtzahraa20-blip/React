import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { apiRequest, requestId } from './api.js';
const endpoints = ['/api/protected', '/api/admin', '/api/echo'];
const pretty = value => JSON.stringify(value, null, 2);
function decode(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error();
    const parse = part => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
    return { header: parse(parts[0]), payload: parse(parts[1]) };
  } catch { return { error: 'This token is not a readable JWT. Use three base64url-encoded segments.' }; }
}
function App() {
  const [token, setToken] = useState('');
  const [endpoint, setEndpoint] = useState(endpoints[0]);
  const [body, setBody] = useState('{"message": "Hello, Gatekeeper!"}');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('Response');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState(null);
  const [options, setOptions] = useState({ name: 'Alex Morgan', role: 'developer', expiresIn: 3600 });
  const [now, setNow] = useState(Date.now());
  const cleanToken = token.trim().replace(/^Bearer\s+/i, '');
  const decoded = decode(cleanToken);
  const method = endpoint === '/api/echo' ? 'POST' : 'GET';
  useEffect(() => {
    let active = true;
    const check = () => apiRequest('/api/health', {}, 5000).then(result => { if (active) setHealth(result.status === 200 && result.body.status === 'online' ? result.body : { status: 'offline', demoEnabled: false }); });
    check(); const timer = setInterval(check, 15000); const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; clearInterval(timer); clearInterval(clock); };
  }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(timer); }, [notice]);
  async function copy(text) { try { await navigator.clipboard.writeText(text); setNotice('Copied to clipboard.'); } catch { setNotice('Clipboard unavailable. Select and copy the text manually.'); } }
  function updateToken(value) { setToken(value); setResult(null); }
  async function generate(scenario = 'valid') {
    setBusy(true); setResult(null);
    try {
      const response = await apiRequest('/api/demo-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...options, scenario }) });
      const data = response.body; if (response.status !== 200 || !data.token) throw new Error(data.error || 'Demo tokens unavailable.');
      setToken(data.token); setNotice('Token generated. Send a request to verify it.');
    } catch (error) { setNotice(error.message); } finally { setBusy(false); }
  }
  async function verify() {
    let data;
    if (method === 'POST') { try { data = JSON.parse(body); } catch { setNotice('Request body must be valid JSON.'); return; } }
    const headers = { ...(cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {}), ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}) };
    const request = { endpoint, method, headers, ...(method === 'POST' ? { body: data } : {}) };
    setBusy(true); setResult(null); setTab('Response'); const start = performance.now();
    let entry;
    try {
      const response = await apiRequest(endpoint, { method, headers, ...(method === 'POST' ? { body: JSON.stringify(data) } : {}) });
      entry = response;
    } catch { entry = { status: 'Error', body: { error: 'API unavailable or request timed out. Check the server and retry.' }, headers: {} }; }
    try {
    entry = { ...entry, id: requestId(), date: new Date().toISOString(), time: Math.round(performance.now() - start), request };
    setResult(entry); setHistory(items => [entry, ...items].slice(0, 20));
    } finally { setBusy(false); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([pretty({ ...result, request: { ...result.request, headers: { ...result.request.headers, Authorization: '[redacted]' } } })], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'gatekeeper-response.json'; link.click(); URL.revokeObjectURL(url);
  }
  const remaining = Number.isFinite(decoded?.payload?.exp) ? Math.ceil(decoded.payload.exp - now / 1000) : null;
  const displayed = tab === 'Request' ? result?.request || { endpoint, method, headers: cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {}, ...(method === 'POST' ? { body } : {}) } : tab === 'Headers' ? result?.headers || {} : result?.body;
  return <div className="layout"><aside><a className="brand" href="#playground"><span className="logo">G</span>gatekeeper<span className="brand-dot">.</span></a><div className="workspace"><span className="avatar">P</span><div>Personal workspace<small>JWT developer toolkit</small></div></div><p className="nav-label">WORKSPACE</p><a className="nav active" href="#playground">▦ <span>JWT Playground</span><span className="nav-dot"/></a><a className="nav" href="#inspector">◇ <span>Token inspector</span></a><a className="nav" href="#history">↺ <span>Request history</span></a><a className="nav" href="#how-it-works">▤ <span>Integration guide</span></a><div className="aside-bottom"><div className="local"><i className={health?.status === 'online' ? '' : 'offline'}/> API {health?.status || 'connecting'}</div><div className="profile"><span className="avatar">64</span><div>Task 64<small>React + Express</small></div></div></div></aside>
  <div className="main-wrap"><header><span>Workspace <b>/</b><strong>JWT Playground</strong></span><span className="task">TASK / 64</span></header><main id="playground"><div className="eyebrow"><span/> AUTHENTICATION TOOLKIT</div><div className="title-row"><div><h1>JWT Playground</h1><p>Good security starts with a verified token.</p></div><span className="express">{health?.status === 'online' ? '● API connected' : '○ API ' + (health?.status || 'connecting')}</span></div>
  <div className="intro"><span className="shield">◇</span><div><strong>Your requests. A little more secure.</strong><p>Generate a token, explore its claims, and test protected routes.<br/>Real signature verification, expiration checks, and role-based access.</p></div><span className="intro-art">{'{'} <span>✓</span> {'}'}</span></div>
  {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}
  <div className="panels"><section className="panel"><div className="panel-heading"><div><span className="step">01</span><h2>Configure request</h2></div><span className="muted">Client</span></div><div className="panel-body"><label htmlFor="endpoint">Protected endpoint</label><div className="endpoint"><span>{method}</span><select id="endpoint" disabled={busy} value={endpoint} onChange={e => { setEndpoint(e.target.value); setResult(null); }}>{endpoints.map(path => <option key={path}>{path}</option>)}</select></div><p className="endpoint-help">{endpoint === '/api/admin' ? 'Requires a verified token with the admin role.' : endpoint === '/api/echo' ? 'Send JSON and receive it with your verified identity.' : 'Accepts any valid token issued for this API.'}</p>
  <div className="label-row"><label htmlFor="token">Authorization token</label><span className="badge">Bearer</span></div><textarea id="token" disabled={busy} spellCheck="false" placeholder="Paste a JWT or a complete Bearer header…" value={token} onChange={e => updateToken(e.target.value)}/><div className="token-actions"><span className="hint">Bearer prefix is handled automatically.</span><button disabled={!token || busy} onClick={() => copy(cleanToken)}>Copy</button><button disabled={!token || busy} onClick={() => updateToken('')}>Clear</button></div>
  <details className="generator"><summary>Demo token settings <span>Customize claims</span></summary><div className="fields"><label>Name<input disabled={busy} maxLength={80} value={options.name} onChange={e => setOptions({ ...options, name: e.target.value })}/></label><label>Role<select aria-label="Role" disabled={busy} value={options.role} onChange={e => setOptions({ ...options, role: e.target.value })}><option value="developer">Developer</option><option value="admin">Admin</option></select></label><label>Lifetime<select aria-label="Lifetime" disabled={busy} value={options.expiresIn} onChange={e => setOptions({ ...options, expiresIn: Number(e.target.value) })}><option value={30}>30 seconds</option><option value={300}>5 minutes</option><option value={3600}>1 hour</option><option value={86400}>24 hours</option></select></label></div></details>
  <div className="sample-row"><span>{health?.demoEnabled ? 'Local demo identity' : 'Demo generation unavailable'}</span><button className="text-btn" disabled={busy || !health?.demoEnabled} onClick={() => generate()}>Generate token ↗</button></div>
  {method === 'POST' && <><label htmlFor="body">JSON request body</label><textarea id="body" disabled={busy} value={body} onChange={e => { setBody(e.target.value); setResult(null); }}/></>}
  <button className="verify" disabled={busy} onClick={verify}>{busy ? 'Processing…' : 'Send request'} <span>→</span></button><div className="quick"><span>Try a scenario</span>{[['expired', 'Expired'], ['signature', 'Bad signature'], ['future', 'Not active'], ['audience', 'Wrong audience']].map(([scenario, label]) => <button key={scenario} disabled={busy || !health?.demoEnabled} onClick={() => generate(scenario)}>{label}</button>)}<button disabled={busy} onClick={() => updateToken('')}>No token</button></div></div></section>
  <section className="panel response"><div className="panel-heading"><div><span className="step">02</span><h2>Inspect response</h2></div><span className="muted">Server</span></div><div className="tabs" role="tablist" aria-label="Response views">{['Response', 'Request', 'Headers'].map(item => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>{item}</button>)}{result && <span className={result.status === 200 ? 'ok' : 'bad'}>{result.status} · {result.time} ms</span>}</div><div className="response-content" role="tabpanel" aria-live="polite">{busy ? <div className="empty" role="status"><h3>Sending request…</h3><p>Waiting for the API response.</p></div> : displayed ? <>{tab === 'Response' && <div className="result-title">{result.status === 200 ? '✓ Access granted' : result.status === 403 ? 'Access denied · administrator required' : 'Request rejected'}</div>}<pre>{pretty(displayed)}</pre></> : <div className="empty"><div className="terminal-icon">&gt;_</div><h3>Ready when you are</h3><p>Add a token and send your first request.<br/>Your server response will appear here.</p><span>AWAITING REQUEST</span></div>}</div><div className="response-footer"><i/>{result ? 'Request complete' : 'Waiting for request'}<button disabled={!displayed} onClick={() => copy(pretty(displayed))}>Copy {tab.toLowerCase()}</button><button disabled={!result} onClick={download}>Export JSON</button></div></section></div>
  <section id="inspector" className="panel extra"><div className="panel-heading"><div><span className="step">03</span><h2>Token inspector</h2></div><span className="badge">Decoded · not verified</span></div><div className="panel-body">{!decoded ? <p>Paste or generate a token to inspect its header and payload.</p> : decoded.error ? <p className="bad">{decoded.error}</p> : <><div className="claim-status"><span className={remaining !== null && remaining <= 0 ? 'bad' : ''}>{remaining === null ? 'No expiration claim' : remaining <= 0 ? 'Token expired' : `Expires in ${Math.floor(remaining / 60)}m ${remaining % 60}s`}</span><span>Signature verification happens on the server.</span></div><div className="decoded-grid"><div><h3>Header</h3><pre>{pretty(decoded.header)}</pre></div><div><h3>Payload</h3><pre>{pretty(decoded.payload)}</pre></div></div></>}</div></section>
  <section id="history" className="panel extra"><div className="panel-heading"><div><h2>Request history</h2><span className="badge">{history.length} / 20</span></div><button className="text-btn" disabled={!history.length || busy} onClick={() => { setHistory([]); setNotice('History cleared.'); }}>Clear history</button></div><div className="panel-body"><p className="history-note">This session only. Select a request to restore its inputs and response.</p>{history.length === 0 ? <p>No requests yet. Your next request will appear here.</p> : <div className="history-list">{history.map(item => <button key={item.id} disabled={busy} onClick={() => { setEndpoint(item.request.endpoint); setToken(item.request.headers.Authorization || ''); setBody(pretty(item.request.body ?? { message: 'Hello, Gatekeeper!' })); setResult(item); setTab('Response'); document.getElementById('playground').scrollIntoView({ behavior: 'smooth' }); }}><span className={item.status === 200 ? 'ok' : 'bad'}>{item.status}</span><code>{item.request.method} {item.request.endpoint}</code><span>{item.time} ms</span><time>{new Date(item.date).toLocaleTimeString()}</time><span>↗</span></button>)}</div>}</div></section>
  <section id="how-it-works" className="how"><div className="how-title"><h2>Integrate the middleware</h2><a className="text-btn" href="https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback" target="_blank" rel="noreferrer">JWT documentation ↗</a></div><div className="checks"><article><span>01 /</span><h3>Extract the token</h3><p>Read Authorization: Bearer &lt;token&gt; from the request.</p></article><article><span>02 /</span><h3>Verify & validate</h3><p>Check HS256, expiration, issuer task-64, and audience task-64-api.</p></article><article><span>03 /</span><h3>Authorize the route</h3><p>Use req.user for the verified identity. Check roles for restricted actions.</p></article></div><pre className="integration">{`import { createAuthMiddleware } from './authMiddleware.js';\n\nconst authMiddleware = createAuthMiddleware(process.env.JWT_SECRET);\napp.get('/api/protected', authMiddleware, (req, res) => {\n  res.json({ user: req.user });\n});`}</pre><p>Demo tokens represent a test identity. Production disables the demo issuer and requires JWT_SECRET and your own login flow.</p></section><footer><span><i/> Secrets stay on the server. Always.</span><span>React + Express · JWT / HS256</span></footer></main></div></div>;
}
createRoot(document.getElementById('root')).render(<App/>);

