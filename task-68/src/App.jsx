import React from 'react';
import TenantIsolationDemo from './components/TenantIsolationDemo';
export default function App() {
  return <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
    <h1>Task 78 — Multi-tenant data isolation</h1>
    <p>Sign in with two Supabase accounts to compare tenant data. Each request verifies your identity and membership; database policies enforce the same boundary.</p>
    <TenantIsolationDemo />
  </main>;
}
