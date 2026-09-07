import React from 'react';
import PaymentForm from './components/PaymentForm';
export default function App() {
  return <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
    <h2>Task 76 - Idempotent payment/order creation</h2>
    <p>Retries reuse one key. Supabase/Postgres commits the order, ledger debit, and replay response together.</p>
    <p>This demo records a USD ledger debit; it does not charge a real payment provider.</p>
    <PaymentForm />
  </main>;
}
