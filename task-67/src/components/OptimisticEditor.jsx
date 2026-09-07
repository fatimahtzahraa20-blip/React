import React, { useEffect, useState } from 'react';
import { request } from '../api';

export default function OptimisticEditor({ docId, tenantId = 'demo-tenant', editorName }) {
  const [doc, setDoc] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [message, setMessage] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setDoc(null);
    setMessage('');
    request('/documents/' + docId, { signal: controller.signal }, tenantId)
      .then(data => { setDoc(data); setDraft(data.body); setConflict(null); })
      .catch(error => { if (error.name !== 'AbortError') setMessage(error.message); });
    return () => controller.abort();
  }, [docId, tenantId, loadAttempt]);

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const data = await request('/documents/' + docId, {
        method: 'PATCH',
        body: JSON.stringify({ version: doc.version, body: draft, editedBy: editorName }),
      }, tenantId);
      setDoc(data);
      setConflict(null);
      setMessage('Saved version ' + data.version + '.');
    } catch (error) {
      if (error.status === 409) setConflict(error.data);
      else setMessage(error.message + ' Your draft is preserved.');
    } finally { setSaving(false); }
  }
  function resolve(keepMine) {
    setDoc(conflict.current);
    if (!keepMine) setDraft(conflict.current.body);
    setConflict(null);
    setMessage(keepMine
      ? 'Draft kept. Edit it to merge if needed, then Save. Further changes can cause another conflict.'
      : 'Loaded the server version.');
  }
  if (!doc) return <section aria-label={editorName}>
    <h2>{editorName}</h2>
    {message ? <><p role="alert">{message}</p><button onClick={() => setLoadAttempt(value => value + 1)}>Retry loading</button></> : <p>Loading...</p>}
  </section>;
  return (
    <section style={{ border: '1px solid #ccc', borderRadius: 12, padding: 20, flex: '1 1 360px', maxWidth: 600 }}>
      <h2>{editorName}: {doc.title} <small>v{doc.version}</small></h2>
      <label>
        Document body
        <textarea aria-label={editorName + ' document body'} disabled={saving} value={draft}
          onChange={event => setDraft(event.target.value)} rows={8}
          style={{ display: 'block', width: '100%', boxSizing: 'border-box', margin: '12px 0' }} />
      </label>
      <button disabled={saving || !!conflict} onClick={save}>{saving ? 'Saving...' : 'Save'}</button>
      <p role="status">{message}</p>
      {conflict && <div role="alert" style={{ background: '#fff8dc', padding: 12 }}>
        <strong>Conflict: your version {conflict.yourVersion}, server version {conflict.current.version}.</strong>
        <p>Last edited by {conflict.current.lastEditedBy || 'unknown'}. Your draft is preserved above.</p>
        <h3>Current server body</h3>
        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{conflict.current.body}</pre>
        <button onClick={() => resolve(true)}>Rebase and keep my draft</button>{' '}
        <button onClick={() => resolve(false)}>Discard mine and take theirs</button>
        <p>To merge manually, edit your draft above, then rebase and save.</p>
      </div>}
    </section>
  );
}

