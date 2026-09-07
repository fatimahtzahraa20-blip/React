import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USER_IDS = '', PORT = '3001' } = process.env;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  : null;
const app = createApp(supabase, ADMIN_USER_IDS.split(',').map(id => id.trim()).filter(Boolean));
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
app.use(express.static(dist));
app.get('/', (_req, res) => res.sendFile(`${dist}/index.html`));
app.listen(Number(PORT), () => console.log(`Task 60 server: http://localhost:${PORT}`));
