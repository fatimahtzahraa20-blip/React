import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Database, Mail, X, Zap, RefreshCw, Copy } from 'lucide-react';
import { validateConfig, statusText } from './lib';
export function Dialog({ children, onClose }) {
  const box = useRef(null), closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const selectors = 'button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]';
    const focusable = () => [...box.current.querySelectorAll(selectors)];
    (box.current.querySelector('input') || focusable()[0])?.focus();
    function keydown(e) {
      if (e.key === 'Escape') closeRef.current();
      if (e.key !== 'Tab') return;
      const items = focusable(), first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', keydown);
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <div className="backdrop" onClick={onClose}><section ref={box} className="modal" role="dialog" aria-modal="true" aria-label="Workspace action" onClick={e => e.stopPropagation()}><button className="close" onClick={onClose} aria-label="Close dialog"><X size={20}/></button>{children}</section></div>;
}
export function ConnectionForm({ config, onConnect }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const next = validateConfig({ url: data.get('url').trim(), key: data.get('key').trim() });
      const response = await fetch(`${next.url}/auth/v1/settings`, { headers: { apikey: next.key }, signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`Connection rejected (HTTP ${response.status}). Check the project URL and public key.`);
      await onConnect(next);
    } catch (error) { setError(error.message || 'Connection failed.'); }
    finally { setBusy(false); }
  }
  return <><span className="step-icon green"><Database size={22}/></span><h2>Connect your Supabase project</h2><p>Only public project details belong here. They are saved in this browser. Keep your service-role key and Resend API key on the server.</p><form onSubmit={submit}><label>Project URL<input name="url" type="url" required defaultValue={config.url} placeholder="https://your-project.supabase.co"/></label><label>Publishable / anon key<input name="key" required defaultValue={config.key} placeholder="sb_publishable_…" autoComplete="off" spellCheck={false}/></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Testing connection…' : 'Test & save connection'}<ArrowRight size={15}/></button></form></>;
}
export function LoginForm({ client, session, onSignOut, onConnect, onSuccess }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const { error } = await client.auth.signInWithPassword({ email: data.get('email').trim(), password: data.get('password') });
      if (error) throw error;
      onSuccess();
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <><span className="step-icon green"><Zap size={23}/></span><h2>{session ? 'Your account' : 'Sign in to Relay'}</h2>{session ? <><p>Signed in as <b>{session.user.email}</b>.</p><p>Access: {session.user.app_metadata?.role === 'operator' ? 'Operator' : 'Operator role required. See the setup guide.'}</p><button className="secondary" onClick={onSignOut}>Sign out</button></> : <><p>Use an existing email/password user from your Supabase project with the operator role. Create this account in Supabase Authentication, then grant its role using the setup SQL.</p><form onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="username"/></label><label>Password<input name="password" type="password" required autoComplete="current-password"/></label>{error && <p role="alert" className="form-error">{error}</p>}<button className="primary" disabled={busy || !client}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={15}/></button></form></>}<button className="text-link" onClick={onConnect}>Change project connection</button></>;
}
export function InsertForm({ onInsert }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    const data = new FormData(event.currentTarget), name = data.get('name').trim(), email = data.get('email').trim();
    try {
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a name and valid email address.');
      await onInsert({ name, email });
    } catch (error) { setError(error.message || 'Insert failed.'); }
    finally { setBusy(false); }
  }
  return <><span className="step-icon green"><Database size={22}/></span><h2>Insert a new contact</h2><p>This saves a real database record and triggers a welcome email to the address below.</p><form onSubmit={submit}><label>Full name<input name="name" required maxLength={100} placeholder="Jamie Smith" disabled={busy}/></label><label>Email address<input name="email" type="email" required maxLength={254} placeholder="jamie@example.com" disabled={busy}/></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Saving contact…' : 'Insert & send welcome email'}<ArrowRight size={15}/></button></form></>;
}
export function Flow() {
  return <div className="flow">{[[Database, 'purple', 'A record is inserted', <>A new row is added to your<br/><code>public.contacts</code> table.</>, 'Database event', 'INSERT'], [Zap, 'green', 'Your function runs', <>The database trigger securely<br/>invokes your Edge Function.</>, 'Edge Function', 'Deno'], [Mail, 'orange', 'A welcome lands', <>Resend accepts your email.<br/>The result is saved to the record.</>, 'Email provider', 'Resend ↗']].map(([Icon, color, title, content, label, tag], i) => <React.Fragment key={title}>{i > 0 && <ArrowRight className="flow-arrow" size={18}/>}<article><span className={'step-icon ' + color}><Icon size={22}/></span><span className="number">0{i + 1}</span><h3>{title}</h3><p>{content}</p><div className="step-label">{label}<b>{tag}</b></div></article></React.Fragment>)}</div>;
}
export function SetupGuide({ onConnect }) {
  return <><span className="step-icon green"><Zap size={23}/></span><h2>Activate your email automation</h2><p>Complete these steps in your existing Supabase project. The README includes exact commands and troubleshooting.</p><ol><li>Link your project and apply both migrations with <code>supabase db push</code>.</li><li>Set <code>RESEND_API_KEY</code>, <code>EMAIL_FROM</code>, and <code>WEBHOOK_SECRET</code> as Edge Function secrets. Use a verified sender domain.</li><li>Deploy with <code>supabase functions deploy send-insert-email</code>.</li><li>Fill in and run <code>supabase/setup.sql</code> to configure the function URL and webhook secret in Vault. The migration already creates the database trigger.</li><li>Create an email/password user in Supabase Authentication and grant the operator role using the setup SQL.</li><li>Connect the app, sign in, and insert a contact. Follow its queued → processing → accepted status here.</li></ol><p>Accepted means the provider accepted the request. Check Resend for final delivery. Failed or stuck jobs can be retried after one minute, within the 23-hour retry window.</p><button className="primary" onClick={onConnect}>Connection settings<ArrowRight size={15}/></button><a className="text-link" href="https://supabase.com/docs/guides/database/webhooks" target="_blank" rel="noreferrer">Supabase documentation <ArrowUpRight size={13}/></a></>;
}
export function EventDetail({ record, onRetry, retryAllowed, busy, error }) {
  const [copied, setCopied] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(record.id); setCopied(true); } catch { setCopied(false); } }
  return <><span className={'badge status-' + record.status}>{statusText[record.status]}</span><h2>{record.name}</h2><p>{record.email}</p><dl className="detail-list">{[['Record ID', record.id], ['Created', new Date(record.created_at).toLocaleString()], ['Attempts', record.attempts], ['Execution', record.duration_ms == null ? 'Not measured yet' : `${record.duration_ms} ms`], ['Provider ID', record.email_id || 'Not accepted yet'], ['Last updated', new Date(record.updated_at).toLocaleString()]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{record.last_error && <p className="form-error">{record.last_error}</p>}{record.status === 'accepted' ? <p>Resend accepted this email. Use the provider ID in Resend to check final delivery.</p> : <p>Retry is available after one minute. Attempts stop after 23 hours from the first send attempt to avoid duplicates outside the provider’s idempotency window. Check function logs if a record remains queued.</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><button className="secondary" onClick={copy}><Copy size={14}/>{copied ? 'Copied' : 'Copy record ID'}</button>{record.status !== 'accepted' && <button className="primary" onClick={onRetry} disabled={busy || !retryAllowed}><RefreshCw size={14}/>{busy ? 'Requeuing…' : 'Retry email'}</button>}</div></>;
}
