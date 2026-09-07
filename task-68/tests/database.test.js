const { test } = require('node:test');
const { readFile } = require('node:fs/promises');
const { PGlite } = require('@electric-sql/pglite');

test('Postgres enforces tenant RLS, immutable ownership, and membership revocation', async () => {
  const db = new PGlite();
  try {
    // Supabase supplies these roles and auth objects in the hosted environment.
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema public, auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
    `);
    await db.exec(await readFile('supabase/migrations/202609070001_tenant_isolation.sql', 'utf8'));
    await db.exec(await readFile('supabase/tests/isolation.sql', 'utf8'));
  } finally {
    await db.close();
  }
});
