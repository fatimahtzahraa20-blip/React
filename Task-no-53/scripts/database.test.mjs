import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('SQL policies, automatic dispatch, atomic claims and retry rules', async () => {
  const db = new PGlite();
  try {
    // pg_net and Vault are hosted services. Stub only their interfaces; execute real PostgreSQL policies and functions.
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create schema auth; create schema vault; create schema net;
      create function auth.jwt() returns jsonb language sql as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
      grant usage on schema auth to authenticated;
      create table vault.decrypted_secrets (name text, decrypted_secret text);
      create table public.test_dispatches (body jsonb);
      create function net.http_post(url text, headers jsonb, body jsonb, timeout_milliseconds integer)
      returns bigint language plpgsql as $$ begin insert into public.test_dispatches values (body); return 1; end; $$;
    `);
    const initial = await readFile(new URL('../supabase/migrations/202609060001_contacts.sql', import.meta.url), 'utf8');
    const live = await readFile(new URL('../supabase/migrations/202609060002_live_email.sql', import.meta.url), 'utf8');
    await db.exec(initial.replace(/^\uFEFF/, ''));
    await db.exec(live.replace(/^\uFEFF/, '').replace('create extension if not exists pg_net with schema extensions;', ''));
    await assert.rejects(db.query("insert into public.contacts(name,email) values ('Test','test@example.com')"), /not configured/);
    await db.exec("insert into vault.decrypted_secrets values ('relay_function_url','https://function.test'),('relay_webhook_secret','test-secret')");
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.contacts'), /permission denied/);
    await db.exec('reset role; set role authenticated');
    await assert.rejects(db.query("insert into public.contacts(name,email) values ('Test','test@example.com')"), /row-level security/);
    await db.exec(`set request.jwt.claims = '{"app_metadata":{"role":"operator"}}'`);
    const { rows: [contact] } = await db.query("insert into public.contacts(name,email) values ('Test','test@example.com') returning *");
    assert.equal(contact.status, 'queued');
    await assert.rejects(db.query("update public.contacts set status = 'accepted'"), /permission denied/);
    await assert.rejects(db.query("insert into public.contacts(name,email,status) values ('Test','test@example.com','accepted')"), /permission denied/);
    await assert.rejects(db.query("select * from public.claim_contact_email($1, gen_random_uuid(), 'sender@example.com')", [contact.id]), /permission denied/);
    await db.exec('reset role');
    assert.equal((await db.query('select count(*)::int as count from test_dispatches')).rows[0].count, 1);
    const first = await db.query("select * from public.claim_contact_email($1, gen_random_uuid(), 'sender@example.com')", [contact.id]);
    assert.equal(first.rows[0].status, 'processing'); assert.equal(first.rows[0].attempts, 1);
    assert.equal(first.rows[0].email_payload.to[0], 'test@example.com');
    assert.equal((await db.query("select * from public.claim_contact_email($1, gen_random_uuid(), 'other@example.com')", [contact.id])).rows.length, 0);
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select public.retry_contact_email($1)', [contact.id]), /Wait one minute/);
    await db.exec('reset role');
    await db.query("update public.contacts set updated_at = now() - interval '2 minutes', status = 'failed' where id = $1", [contact.id]);
    await db.exec('set role authenticated');
    await db.query('select public.retry_contact_email($1)', [contact.id]);
    await db.exec('reset role');
    assert.equal((await db.query('select count(*)::int as count from test_dispatches')).rows[0].count, 2);
    const retry = await db.query("select * from public.claim_contact_email($1, gen_random_uuid(), 'new-sender@example.com')", [contact.id]);
    assert.deepEqual(retry.rows[0].email_payload, first.rows[0].email_payload); assert.equal(retry.rows[0].attempts, 2);
    await db.query("update public.contacts set status='failed', first_attempt_at=now()-interval '24 hours', updated_at=now()-interval '2 minutes' where id=$1", [contact.id]);
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select public.retry_contact_email($1)', [contact.id]), /Retry window expired/);
    await db.exec('reset role');
    await db.query("update public.contacts set status='accepted' where id=$1", [contact.id]);
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select public.retry_contact_email($1)', [contact.id]), /already accepted/);
  } finally { await db.close(); }
});
