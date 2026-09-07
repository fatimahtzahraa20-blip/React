import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { createApp } from './app.js';
import { createSafepay } from './safepay.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SAFEPAY_PUBLIC_KEY', 'SAFEPAY_UNIT_AMOUNT', 'APP_URL'];
const missing = required.filter(key => !process.env[key] || /^(your-|replace|https:\/\/YOUR_)/i.test(process.env[key]));
let configurationError = missing.length ? `Configure these .env settings and restart npm run dev: ${missing.join(', ')}.` : '';
if (!configurationError && !process.env.SAFEPAY_PUBLIC_KEY?.startsWith('sec_')) configurationError = 'Set SAFEPAY_PUBLIC_KEY to the Public API Key (starts with sec_) from your Safepay dashboard. The private secret key is not used for checkout initialization.';
const environment = process.env.SAFEPAY_ENVIRONMENT || 'sandbox';
const unitAmount = Number(process.env.SAFEPAY_UNIT_AMOUNT);
const currency = process.env.SAFEPAY_CURRENCY || 'PKR';
if (!configurationError && (!Number.isSafeInteger(unitAmount) || unitAmount <= 0 || unitAmount > 100000000)) configurationError = 'Set SAFEPAY_UNIT_AMOUNT to a positive whole-number amount (maximum 100000000).';
if (!['sandbox', 'production'].includes(environment)) configurationError = 'SAFEPAY_ENVIRONMENT must be sandbox or production.';
if (!['PKR', 'USD'].includes(currency)) configurationError = 'SAFEPAY_CURRENCY must be PKR or USD.';
const expectedHost = environment === 'sandbox' ? 'https://sandbox.api.getsafepay.com' : 'https://api.getsafepay.com';
if (process.env.SAFEPAY_API_BASE_URL && process.env.SAFEPAY_API_BASE_URL.replace(/\/$/, '') !== expectedHost) configurationError = 'SAFEPAY_API_BASE_URL must match SAFEPAY_ENVIRONMENT.';
let supabase, createPayment;
if (!configurationError) {
  try {
    const appUrl = new URL(process.env.APP_URL);
    if (!['http:', 'https:'].includes(appUrl.protocol) || (environment === 'production' && appUrl.protocol !== 'https:')) throw new Error();
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    createPayment = createSafepay({ publicKey: process.env.SAFEPAY_PUBLIC_KEY, environment, appUrl: appUrl.origin });
  } catch { configurationError = 'Check SUPABASE_URL and APP_URL in .env. Production requires HTTPS.'; }
}
const app = createApp({ supabase, createPayment, unitAmount, currency, configurationError });
app.use(express.static('dist'));
app.listen(process.env.PORT || 3001, () => {
  console.log('Safepay checkout server listening on port', process.env.PORT || 3001);
  if (configurationError) console.warn(configurationError);
});
