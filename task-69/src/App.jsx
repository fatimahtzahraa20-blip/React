import React from 'react';
import SoftDeleteDemo from './components/SoftDeleteDemo';
export default function App() {
  return <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
    <h1>Task 79 — Soft-delete + restore</h1>
    <p>Supabase stores deleted items in trash. Live SKUs are unique per tenant.
      Delete an item, reuse its SKU, then try restoring it to see a restore conflict.</p>
    <p>Local demo tenant: <code>demo-tenant</code>. Records remain in trash until restored.</p>
    <SoftDeleteDemo />
  </main>;
}
