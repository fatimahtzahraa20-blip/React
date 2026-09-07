import { readPaymentResponse } from './payment-response.js';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  async function authenticate(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const signUp = event.nativeEvent.submitter.value === 'signup';
      const { error } = await supabase.auth[signUp ? 'signUp' : 'signInWithPassword']({ email, password });
      if (error) throw error;
      if (signUp) setMessage('Account created. Check your email to confirm your account before signing in.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function checkout() {
    setBusy(true); setMessage('');
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Please sign in again.');
      const response = await fetch('/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}`, 'Idempotency-Key': requestId },
        body: JSON.stringify({ quantity }),
      });
      const result = await readPaymentResponse(response);
      if (!response.ok) throw new Error(result.error);
      window.location.assign(result.url);
    } catch (error) { setMessage(error.message); setBusy(false); }
  }
  const outcome = new URLSearchParams(location.search).get('checkout');
  return <main><header><span className="logo">69</span><span>Task 69 <small>PAYMENTS</small></span></header>
    <section><p className="eyebrow">SIMPLE, SECURE CHECKOUT</p><h1>One step closer.<br/><span>Make it yours.</span></h1><p className="intro">Sign in to continue to Safepay’s secure checkout.</p>
    <div className="card"><div className="card-top"><h2>Your checkout</h2><span className="badge">Safepay Checkout</span></div>
    {!supabase ? <p role="alert">Add your Supabase settings to .env to enable sign-in.</p> : !session ? <form onSubmit={authenticate}><label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></label><button disabled={busy} value="signin">Sign in</button><button className="secondary" disabled={busy} value="signup">Create account</button></form> : <><p className="account">Signed in as {session.user.email}</p><label>Quantity<select disabled={busy} value={quantity} onChange={e => { setQuantity(Number(e.target.value)); setRequestId(crypto.randomUUID()); }}>{Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label><p className="note">Your total and available payment methods will appear on Safepay Checkout.</p><button onClick={checkout} disabled={busy}>{busy ? 'Preparing checkout…' : 'Continue to checkout →'}</button><button className="secondary" disabled={busy} onClick={() => supabase.auth.signOut()}>Sign out</button></>}
    {message && <p role="status">{message}</p>}
    {outcome === 'success' && <p role="status">You’ve returned from Checkout. Payment confirmation is handled by Safepay; this page does not verify payment.</p>}
    {outcome === 'cancelled' && <p role="status">Checkout cancelled. You can try again when you’re ready.</p>}
    </div><p className="footnote">Payments securely processed by Safepay</p></section><footer>React + Supabase <span>Task 69</span></footer></main>;
}
createRoot(document.getElementById('root')).render(<App />);
