import React, { useEffect, useRef, useState } from 'react';

export default function CreateOrder({ supabase, demoCustomers, onCreated }) {
  const [customers, setCustomers] = useState(supabase ? [] : demoCustomers);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, value) => { if (active) setSession(value); });
    async function load() {
      try {
        const auth = await supabase.auth.getSession();
        if (auth.error) throw auth.error;
        if (active) setSession(auth.data.session);
        const result = await supabase.from('customers').select('id,name,email').order('name');
        if (result.error) throw result.error;
        if (active) setCustomers(result.data);
      } catch (err) { if (active) setError(`Could not load form: ${err.message}`); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [supabase]);

  async function signIn(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true); setError('');
    try {
      const result = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
      if (result.error) throw result.error;
      setSession(result.data.session);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const customer = customers.find(c => String(c.id) === form.get('customer'));
    const description = String(form.get('description')).trim();
    const amount = Number(form.get('amount'));
    if (!customer || !description || !Number.isFinite(amount) || amount < 0.01 || amount > 1000000) {
      setError('Choose a customer, enter a product description and a valid amount.'); return;
    }
    submitting.current = true; setSaving(true); setError('');
    try {
      const order = { customer_id: customer.id, description, amount, status: form.get('status') };
      let saved = { ...order, created_at: new Date().toISOString() };
      if (supabase) {
        const result = await supabase.from('orders').insert(order).select().single();
        if (result.error) throw result.error;
        saved = result.data;
      }
      onCreated({ ...saved, customer_name: customer.name, customer_email: customer.email });
    } catch (err) {
      setError(err.code === '42501'
        ? 'Order creation is not enabled for this account. Run supabase/enable-order-creation.sql in the Supabase SQL editor and ensure this account has the order_manager app role.'
        : `Could not create order: ${err.message}`);
    } finally { submitting.current = false; setSaving(false); }
  }
  if (supabase && !session) return <><h2>Sign in to create orders</h2><p>Use your workspace account. Your session is remembered on this device.</p>{error && <div className="error" role="alert">{error}</div>}<form onSubmit={signIn}><label>Email<input name="email" type="email" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label><button className="button primary" disabled={saving || loading}>{saving ? 'Signing in...' : 'Sign in'}</button></form></>;
  return <><h2>Create an order</h2><p>Choose a customer and add the order details. {supabase ? 'Your order will be saved to Supabase.' : 'This order will be added to the demo.'}</p>
    {supabase && <p>Signed in as {session.user.email} <button className="sql-button" onClick={async () => { const {error} = await supabase.auth.signOut(); if (error) setError(error.message); }}>Sign out</button></p>}
    <form onSubmit={submit}>{error && <div className="error" role="alert">{error}</div>}
      <fieldset disabled={loading || saving} style={{border: 0, padding: 0, margin: 0, minWidth: 0}}>
        <label>Customer<select name="customer" required defaultValue=""><option value="" disabled>{loading ? 'Loading customers...' : 'Select a customer'}</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}</select></label>
        {!loading && !error && !customers.length && <p>No customers yet. Add a customer in your Supabase customers table, then reopen this form.</p>}
        <label>Product / Description<input name="description" required placeholder="e.g. Premium workspace plan" maxLength="120"/></label>
        <label>Amount (USD)<input name="amount" type="number" min="0.01" max="1000000" step="0.01" required placeholder="249.00"/></label>
        <label>Status<select name="status" defaultValue="Pending">{['Pending', 'Processing', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select></label>
        <button className="button primary" type="submit" disabled={!customers.length} style={{width: '100%', marginTop: 8}}>{saving ? 'Saving order...' : 'Create order'}</button>
      </fieldset>
    </form>
  </>;
}
