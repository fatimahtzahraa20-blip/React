import React, { useState } from 'react';
import OptimisticEditor from './components/OptimisticEditor';
import { request, isDocumentId } from './api';

export default function App() {
  const initialId = new URLSearchParams(location.search).get('doc') || '';
  const [docId, setDocId] = useState(() => isDocumentId(initialId) ? initialId : '');
  const [inputId, setInputId] = useState(initialId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() => initialId && !isDocumentId(initialId) ? 'Invalid document ID. Paste a UUID from an existing document or create a shared document.' : '');
  function open(id) {
    if (!isDocumentId(id)) {
      setError('Invalid document ID. Paste a UUID from an existing document or create a shared document.');
      return;
    }
    setError('');
    setDocId(id);
    setInputId(id);
    const url = new URL(location.href);
    url.searchParams.set('doc', id);
    history.replaceState(null, '', url);
  }
  async function create() {
    setBusy(true);
    setError('');
    try {
      const doc = await request('/documents', {
        method: 'POST',
        body: JSON.stringify({ title: 'Shared document', body: 'Edit me from both panes.', editedBy: 'creator' }),
      });
      open(doc.id);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Task 77: Optimistic-locking updates</h1>
      <p>Save an edit in Editor A, then save a different edit in Editor B to see a version conflict.</p>
      <button disabled={busy} onClick={create}>{busy ? 'Creating...' : 'Create shared document'}</button>
      <form onSubmit={event => { event.preventDefault(); open(inputId.trim()); }} style={{ margin: '16px 0' }}>
        <label>Document ID <input required value={inputId} onChange={event => setInputId(event.target.value)} /></label>
        <button disabled={busy} type="submit">Open document</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {docId && <>
        <p>Document: {docId}. This URL reopens the same document in another tab.</p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <OptimisticEditor key={docId + '-a'} docId={docId} editorName="Editor A" />
          <OptimisticEditor key={docId + '-b'} docId={docId} editorName="Editor B" />
        </div>
      </>}
    </main>
  );
}

