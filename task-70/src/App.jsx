import React from 'react';
import DedupDemo from './components/DedupDemo';
export default function App() {
  return <main style={{ padding: 24, maxWidth: 850, margin: 'auto', fontFamily: 'system-ui, sans-serif' }}>
    <h1>Task 80: API request deduplication</h1>
    <p>Share duplicate requests, reuse cached responses, cancel safely, and keep the latest search results. Items are stored in Supabase.</p>
    <DedupDemo />
  </main>;
}

