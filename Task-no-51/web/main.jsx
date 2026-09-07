import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configured = Boolean(url && key && !url.includes('your-project') && !key.startsWith('your-'));
let auth = null;
let configurationError = '';
if (configured) {
  try { auth = createClient(url, key); }
  catch { configurationError = 'The Supabase configuration is invalid. Check the project URL and public key, then restart the app.'; }
}
const localMode = !configured;
const LOCAL_KEY = 'folio.local-avatar.v1';

export async function normalizePicture(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Your image must be 5 MiB or smaller.');
  let bitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error('This image could not be opened. Choose a valid image file.'); }
  try {
    if (bitmap.width * bitmap.height > 25_000_000) throw new Error('Choose an image with at most 25 million pixels.');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const side = Math.min(bitmap.width, bitmap.height);
    canvas.getContext('2d').drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 512, 512);
    return canvas.toDataURL('image/webp', 0.85);
  } finally { bitmap.close(); }
}

function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState('');
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState(configurationError ? { text: configurationError, error: true } : null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);
  const authForm = useRef(null);
  const selection = useRef(0);
  const pictureVersion = useRef(0);
  const xhrRef = useRef(null);
  const say = (text, error = false) => setNotice({ text, error });
  const initial = (session?.user.email || 'You')[0].toUpperCase();

  useEffect(() => {
    if (localMode) {
      try { setSaved(localStorage.getItem(LOCAL_KEY) || ''); }
      catch { say('Browser storage is unavailable. Enable site storage to save a picture.', true); }
    }
    if (!auth) return;
    auth.auth.getSession().then(({ data, error }) => {
      if (error) say(error.message, true);
      setSession(data.session); setAuthReady(true);
    }).catch(() => { setAuthReady(true); say('Could not restore your session. Please sign in again.', true); });
    const { data } = auth.auth.onAuthStateChange((_event, next) => { setSession(next); setAuthReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function api(path, options = {}) {
    const { data: { session: current }, error } = await auth.auth.getSession();
    if (error || !current) throw new Error('Your session has expired. Sign in again to continue.');
    let response;
    try { response = await fetch(path, { ...options, headers: { Authorization: `Bearer ${current.access_token}` }, signal: options.signal || AbortSignal.timeout(20000) }); }
    catch (error) { if (error.name === 'AbortError') throw error; throw new Error('Cannot reach the upload API. Start it with npm run dev:api and try again.'); }
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || 'The upload API is unavailable. Check that Express is running and configured.');
    return result;
  }

  useEffect(() => {
    if (localMode || !authReady) return;
    setSaved('');
    if (!session) return;
    const controller = new AbortController();
    async function refresh() {
      const version = pictureVersion.current;
      try {
        const result = await api('/api/profile-picture', { signal: controller.signal });
        if (!controller.signal.aborted && version === pictureVersion.current) setSaved(result.data?.url || '');
      } catch (error) { if (!controller.signal.aborted) say(error.message, true); }
    }
    refresh();
    const timer = setInterval(refresh, 50 * 60 * 1000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [session?.user.id, authReady]);

  async function signIn(event) {
    event.preventDefault(); setBusy('auth'); setNotice(null);
    try {
      if (!auth) throw new Error(configurationError || 'Configure Supabase to sign in.');
      const { data, error } = signup
        ? await auth.auth.signUp({ email, password })
        : await auth.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setPassword('');
      say(signup && !data.session ? 'Check your email to confirm your account, then sign in here.' : 'Signed in. Your selected picture is ready to save.');
    } catch (error) { say(error.message, true); }
    finally { setBusy(''); }
  }

  async function selectFiles(files) {
    if (busy || !files?.length) return;
    if (files.length !== 1) { say('Choose one picture at a time.', true); return; }
    const id = ++selection.current;
    setBusy('validating'); setNotice(null);
    try {
      const next = files[0];
      const nextPreview = await normalizePicture(next);
      if (id === selection.current) { setFile(next); setPreview(nextPreview); setConfirmRemove(false); }
    } catch (error) { say(error.message, true); }
    finally { setBusy(''); }
  }

  function cancel() {
    if (busy === 'uploading') { xhrRef.current?.abort(); return; }
    setFile(null); setPreview(''); setConfirmRemove(false); say('Changes discarded. Your saved picture is unchanged.');
  }

  async function upload() {
    if (!file) { say('Choose an image first, then save your picture.'); fileInput.current?.click(); return; }
    if (!localMode && !session) { say('Sign in or create an account below to save to Supabase. Your selected image will be kept.', true); authForm.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); authForm.current?.querySelector('input')?.focus(); return; }
    setBusy('uploading'); setProgress(0); setNotice(null);
    pictureVersion.current++;
    try {
      if (localMode) {
        localStorage.setItem(LOCAL_KEY, preview);
        setSaved(preview); say('Picture saved in this browser. It has not been uploaded to Supabase.');
      } else {
        const { data: { session: current } } = await auth.auth.getSession();
        if (!current) throw new Error('Your session has expired. Sign in again.');
        const body = new FormData(); body.append('avatar', file);
        const result = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest(); xhrRef.current = xhr;
          xhr.open('POST', '/api/profile-picture'); xhr.timeout = 60000;
          xhr.setRequestHeader('Authorization', `Bearer ${current.access_token}`);
          xhr.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)); };
          xhr.onerror = () => reject(new Error('Cannot reach the upload API. Start it with npm run dev:api and retry.'));
          xhr.ontimeout = () => reject(new Error('Upload timed out. Check your connection and retry.'));
          xhr.onabort = () => reject(new Error('Upload cancelled. If it had reached the server, refresh to check the saved picture.'));
          xhr.onload = () => {
            let result; try { result = JSON.parse(xhr.responseText); } catch { reject(new Error('The upload API is unavailable. Check your server configuration.')); return; }
            if (xhr.status >= 200 && xhr.status < 300) resolve(result);
            else reject(new Error(result.error || 'Upload failed. Please try again.'));
          };
          xhr.send(body);
        });
        setSaved(result.data.url); say('Your profile picture has been saved to Supabase.');
      }
      setFile(null); setPreview('');
    } catch (error) { say(error.name === 'QuotaExceededError' ? 'Browser storage is full. Free some space and try again.' : error.message, true); }
    finally { setBusy(''); xhrRef.current = null; }
  }

  async function removePicture() {
    setBusy('removing'); setNotice(null); pictureVersion.current++;
    try {
      if (localMode) localStorage.removeItem(LOCAL_KEY);
      else await api('/api/profile-picture', { method: 'DELETE' });
      setSaved(''); setFile(null); setPreview(''); setConfirmRemove(false); say('Your profile picture has been removed.');
    } catch (error) { say(error.message, true); }
    finally { setBusy(''); }
  }

  const hint = busy === 'validating' ? 'Checking your image…' : file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : 'Choose a photo to get started.';
  return <div className="layout">
    <aside><a className="brand" href="/">◈ <span>folio<span className="dot">.</span></span></a><div className="workspace">PERSONAL WORKSPACE</div><div className="nav active">◉ <span>My profile</span></div><div className="aside-bottom"><span className="status-dot"/>{localMode ? 'Browser storage mode' : 'Powered by Supabase'}</div></aside>
    <div className="main"><header><span>Workspace <span className="slash">/</span> <strong>My profile</strong></span><span className="header-avatar">{saved ? <img src={saved} alt="Saved avatar"/> : initial}</span></header>
    <main><div className="eyebrow">YOUR SPACE, YOUR IDENTITY</div><h1>A little more you.</h1><p className="intro">Give your profile a face. Make it easy for people to recognize you.</p>
    {localMode && <div className="mode-banner"><strong>Browser-only mode</strong><span>Save and manage your picture on this device. Connect Supabase in .env to enable account-based cloud uploads.</span></div>}
    <section className="card" aria-busy={Boolean(busy)}><div className="card-heading"><div><h2>Profile picture</h2><p>Your photo, wherever you show up.</p></div><span className="badge">{localMode ? 'LOCAL' : 'CLOUD'}</span></div>
    <div className="editor"><div className="preview-column"><div className="avatar">{preview || saved ? <img src={preview || saved} alt={preview ? 'Preview of selected picture' : 'Your saved profile picture'}/> : <span>{initial}</span>}</div><strong>{file ? 'Looking good!' : 'Your profile photo'}</strong><small>{file ? '512 × 512 · Preview before saving' : 'Make a great first impression'}</small>{saved && <button className="remove-link" disabled={Boolean(busy)} onClick={() => setConfirmRemove(true)}>Remove picture</button>}</div>
    <div className="upload-column"><label className={`dropzone ${dragging ? 'dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); selectFiles(e.dataTransfer.files); }}><input ref={fileInput} aria-label="Choose profile picture" type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(busy)} onChange={e => { selectFiles(e.target.files); e.target.value = ''; }}/><span className="upload-icon">↑</span><strong><span>Click to upload</span> or drag and drop</strong><small>JPG, PNG or WebP · Maximum 5 MiB</small><span className="browse">{file || saved ? 'Choose another image' : 'Choose image'}</span></label><p className="tip">ⓘ &nbsp; Your photo is cropped to a square, exactly as shown in the preview.</p></div></div>
    {busy === 'uploading' && <div className="upload-progress"><progress max="100" value={progress}/><span>{localMode ? 'Saving…' : progress === 100 ? 'Processing and saving…' : `Uploading ${progress}%`}</span></div>}
    {notice && <div role={notice.error ? 'alert' : 'status'} className={`feedback ${notice.error ? 'error' : ''}`}>{notice.text}</div>}
    {confirmRemove && <div className="remove-confirm" role="group" aria-label="Confirm picture removal"><span>Remove your saved profile picture?</span><button className="secondary" disabled={Boolean(busy)} onClick={() => setConfirmRemove(false)}>Keep picture</button><button disabled={Boolean(busy)} onClick={removePicture}>{busy === 'removing' ? 'Removing…' : 'Remove'}</button></div>}
    <div className="card-footer"><span>{hint}</span><div><button className="secondary" disabled={!file || (Boolean(busy) && busy !== 'uploading')} onClick={cancel}>Cancel</button><button disabled={Boolean(busy) || !authReady} onClick={upload}>{busy === 'uploading' ? 'Saving…' : 'Save picture'} <span>↗</span></button></div></div></section>
    <div className="below"><span className="lock">▣</span><div><strong>{localMode ? 'Your picture stays on this device.' : 'Stored securely. Always yours.'}</strong><p>{localMode ? 'Saved pictures persist after refresh. Clearing browser data removes them.' : 'Your picture is stored privately. Viewing links refresh while this page is open.'}</p></div></div>
    {!localMode && !session && <form ref={authForm} className="signin" onSubmit={signIn}><h2>{signup ? 'Create your account' : 'Sign in to save to Supabase'}</h2><p>{signup ? 'You may need to confirm your email before signing in.' : 'Your selected picture stays ready while you sign in.'}</p><div className="fields"><label>Email<input type="email" autoComplete="email" required value={email} disabled={Boolean(busy)} onChange={e => setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required value={password} disabled={Boolean(busy)} onChange={e => setPassword(e.target.value)}/></label><button disabled={Boolean(busy) || !auth}>{busy === 'auth' ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button></div><button type="button" className="auth-toggle" disabled={Boolean(busy)} onClick={() => setSignup(!signup)}>{signup ? 'Already have an account? Sign in' : 'New here? Create an account'}</button></form>}
    {session && <div className="account">Signed in as {session.user.email}<button className="secondary" disabled={Boolean(busy)} onClick={async () => {
      setBusy('auth');
      try { const { error } = await auth.auth.signOut(); if (error) throw error; pictureVersion.current++; setFile(null); setPreview(''); setSaved(''); say('Signed out.'); }
      catch (error) { say(error.message, true); } finally { setBusy(''); }
    }}>Sign out</button></div>}
    <footer>YOUR PROFILE. YOUR FIRST IMPRESSION.</footer></main></div></div>;
}
createRoot(document.getElementById('root')).render(<App/>);
