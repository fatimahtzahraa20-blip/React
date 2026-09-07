import { createClient } from '@supabase/supabase-js';
const configKey = 'relay.connection.v1';
export function readConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(configKey) || 'null');
    if (saved) return saved;
  } catch { /* A corrupt or unavailable local store must not crash startup. */ }
  return { url: import.meta.env.VITE_SUPABASE_URL || '', key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '' };
}
export function validateConfig(config) {
  const parsed = new URL(config.url);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))) throw new Error('Use an HTTPS Supabase project URL (HTTP is allowed for localhost).');
  if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error('Use the base Supabase project URL without paths or credentials.');
  if (config.key.startsWith('sb_secret_')) throw new Error('Use a publishable key, never a secret key.');
  if (!config.key.startsWith('sb_publishable_')) {
    try {
      const part = config.key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(part));
      if (payload.role !== 'anon') throw new Error();
    } catch { throw new Error('Enter a Supabase publishable key or legacy anon key. Service-role keys must never be used here.'); }
  }
  return { url: parsed.origin, key: config.key.trim() };
}
export function saveConfig(config) { localStorage.setItem(configKey, JSON.stringify(config)); }
export function makeClient(config) {
  if (!config.url || !config.key || config.url.includes('YOUR_PROJECT_REF')) return null;
  try { const valid = validateConfig(config); return createClient(valid.url, valid.key); } catch { return null; }
}
export const fields = 'id,name,email,status,email_id,last_error,duration_ms,attempts,created_at,updated_at,accepted_at,first_attempt_at';
export const statusText = { queued: 'Queued', processing: 'Processing', accepted: 'Accepted', failed: 'Failed' };
export function canRetry(record, now = Date.now()) {
  return record.status !== 'accepted' && now - Date.parse(record.updated_at) >= 60000 && (!record.first_attempt_at || now - Date.parse(record.first_attempt_at) < 23 * 3600000);
}
export function stats(rows) {
  const completed = rows.filter(row => ['accepted', 'failed'].includes(row.status));
  const accepted = rows.filter(row => row.status === 'accepted').length;
  const timed = completed.filter(row => Number.isFinite(row.duration_ms));
  return { total: rows.length, rate: completed.length ? `${Math.round(100 * accepted / completed.length)}%` : '—', duration: timed.length ? `${Math.round(timed.reduce((sum, row) => sum + row.duration_ms, 0) / timed.length)} ms` : '—' };
}
