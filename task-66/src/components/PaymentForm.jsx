import React, { useRef, useState } from 'react';
export default function PaymentForm({ tenantId = 'demo-tenant' }) {
  const [accountId, setAccountId] = useState('acct_1');
  const [amount, setAmount] = useState('25.00');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const attempt = useRef(null);
  const lock = useRef(false);
  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return setError('Enter a positive amount with at most two decimal places.');
    const [whole, fraction = ''] = amount.split('.');
    const amountCents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || !accountId.trim()) return setError('Enter an account and valid positive amount.');
    const body = { accountId, amountCents, currency: 'USD' };
    const signature = JSON.stringify({ tenantId, ...body });
    if (!attempt.current || attempt.current.signature !== signature) attempt.current = { signature, key: crypto.randomUUID() };
    lock.current = true;
    setStatus('submitting');
    setError('');
    try {
      const response = await fetch((import.meta.env.VITE_API_BASE || '') + '/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, 'Idempotency-Key': attempt.current.key },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({ message: 'The payment service is unavailable. Please try again shortly.' }));
      if (!response.ok) throw new Error(data.message || data.error || 'Payment failed');
      setResult({ ...data, replayed: response.headers.get('Idempotency-Replayed') === 'true' });
      setStatus('success');
    } catch (err) {
      setError(err instanceof TypeError ? 'Cannot reach the payment service. Please try again shortly.' : err.message);
      setStatus('error');
    } finally { lock.current = false; }
  }
  return <form onSubmit={submit} style={{ maxWidth: 420, border: '1px solid #ddd', padding: 24, borderRadius: 12 }}>
    <h3>Make a payment</h3>
    <label>Account<input required maxLength={200} disabled={status !== 'idle'} value={accountId} onChange={e => setAccountId(e.target.value)} style={inputStyle} /></label>
    <label>Amount (USD)<input required inputMode="decimal" disabled={status !== 'idle'} value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} /></label>
    <button disabled={status === 'submitting'} type="submit">{status === 'submitting' ? 'Processing...' : status === 'success' ? 'Replay same payment' : status === 'error' ? 'Retry same payment' : 'Pay'}</button>
    {status === 'success' && <button type="button" onClick={() => { attempt.current = null; setResult(null); setError(''); setStatus('idle'); }} style={{ marginLeft: 12 }}>New payment</button>}
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    {result && <p role="status">Order {result.orderId}: {(result.amountCents / 100).toFixed(2)} {result.currency}{result.replayed ? ' (replayed; no additional debit)' : ' paid'}</p>}
  </form>;
}
const inputStyle = { display: 'block', boxSizing: 'border-box', width: '100%', padding: 10, margin: '6px 0 16px' };
