const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');
const { ItemRepository } = require('../models/Item');
const { createApp } = require('../server');

test('migration: lifecycle, uniqueness, isolation, timestamps and permissions', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    await db.exec(readFileSync('supabase/migrations/202609070001_soft_delete.sql', 'utf8'));
    const create = async (tenant, sku) => (await db.query(
      "insert into items(tenant_id,name,sku) values ($1,'Example',$2) returning *", [tenant, sku])).rows[0];
    const rpc = async (fn, tenant, id, actor) => {
      const params = actor === undefined ? [tenant, id] : [tenant, id, actor];
      return (await db.query('select ' + fn + '(' + params.map((_, i) => '$' + (i + 1)).join(',') + ') as item', params)).rows[0].item;
    };
    const original = await create('tenant-a', 'ABC');
    await assert.rejects(create('tenant-a', 'ABC'), e => e.code === '23505');
    await create('tenant-b', 'ABC');
    assert.equal(await rpc('soft_delete_item', 'tenant-b', original.id, 'actor'), null);
    const deleted = await rpc('soft_delete_item', 'tenant-a', original.id, 'actor');
    assert.equal(deleted.deleted_by, 'actor');
    assert.ok(deleted.deleted_at);
    assert.equal(new Date(deleted.created_at).getTime(), new Date(original.created_at).getTime());
    assert.ok(new Date(deleted.updated_at) >= new Date(original.updated_at));
    assert.equal(await rpc('soft_delete_item', 'tenant-a', original.id, 'other'), null);
    const replacement = await create('tenant-a', 'ABC');
    await assert.rejects(rpc('restore_item', 'tenant-a', original.id), e => e.code === '23505');
    const retained = (await db.query('select * from items where id=$1', [original.id])).rows[0];
    assert.equal(retained.deleted_by, 'actor');
    assert.ok(retained.deleted_at);
    assert.equal(await rpc('restore_item', 'tenant-b', original.id), null);
    await rpc('soft_delete_item', 'tenant-a', replacement.id, 'actor');
    const restored = await rpc('restore_item', 'tenant-a', original.id);
    assert.equal(restored.id, original.id);
    assert.equal(restored.deleted_at, null);
    assert.equal(restored.deleted_by, null);
    assert.equal(await rpc('restore_item', 'tenant-a', original.id), null);
    assert.equal((await db.query("select count(*)::int n from items where tenant_id='tenant-a' and deleted_at is null")).rows[0].n, 1);
    assert.equal((await db.query("select count(*)::int n from items where tenant_id='tenant-a' and deleted_at is not null")).rows[0].n, 1);
    await assert.rejects(db.query("insert into items(tenant_id,name,sku) values ('a','','')"), e => e.code === '23514');
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from items'), e => e.code === '42501');
    await assert.rejects(rpc('restore_item', 'tenant-a', original.id), e => e.code === '42501');
    await db.exec('reset role; set role authenticated');
    await assert.rejects(db.query('select * from items'), e => e.code === '42501');
    await db.exec('reset role; set role service_role');
    await assert.rejects(db.query('delete from items'), e => e.code === '42501');
    assert.ok(await rpc('soft_delete_item', 'tenant-a', original.id, 'service'));
  } finally { await db.close(); }
});

test('repository defaults, immutable visibility scopes, tenant preservation and conflict mapping', async () => {
  const calls = [];
  const query = {};
  for (const method of ['select', 'eq', 'is', 'not']) query[method] = (...args) => { calls.push([method, ...args]); return query; };
  const client = { from: table => { assert.equal(table, 'items'); return query; } };
  const repo = new ItemRepository(client, 'tenant-a');
  repo.query();
  assert.deepEqual(calls, [['select', '*'], ['eq', 'tenant_id', 'tenant-a'], ['is', 'deleted_at', null]]);
  calls.length = 0;
  repo.onlyDeleted().query();
  assert.deepEqual(calls.at(-1), ['not', 'deleted_at', 'is', null]);
  calls.length = 0;
  repo.withDeleted().query();
  assert.deepEqual(calls, [['select', '*'], ['eq', 'tenant_id', 'tenant-a']]);
  assert.equal(repo.scope, 'live');
  assert.throws(() => new ItemRepository(client, ''), /Tenant/);
  assert.throws(() => repo.result({ error: { code: '23505' } }, true), e => e.status === 409 && e.code === 'RESTORE_CONFLICT');
});

test('HTTP validation, async failures, not-found and restore conflicts', async () => {
  const client = {
    from: () => {
      let restoring = false;
      const query = {
        update: values => { restoring = values.deleted_at === null; return query; },
        eq: (field, value) => { if (field === 'tenant_id') assert.equal(value, 'tenant-a'); return query; },
        is: () => query, not: () => query,
        select: () => { throw new Error('simulated database outage'); },
        maybeSingle: async () => restoring ? { error: { code: '23505' } } : { data: null },
      };
      query.update = values => {
        restoring = values.deleted_at === null;
        query.select = () => query;
        return query;
      };
      return query;
    },
  };
  const server = createApp(client).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const call = (path, options = {}) => fetch(base + path, { ...options,
    headers: { 'x-tenant-id': 'tenant-a', 'Content-Type': 'application/json', ...options.headers } });
  try {
    assert.equal((await call('/items', { headers: { 'x-tenant-id': '' } })).status, 400);
    assert.equal((await call('/items?limit=101')).status, 400);
    assert.equal((await call('/items', { method: 'POST', body: JSON.stringify({ name: '  ', sku: 'ABC' }) })).status, 400);
    assert.equal((await call('/items/no-id', { method: 'DELETE' })).status, 400);
    const id = '00000000-0000-0000-0000-000000000001';
    assert.equal((await call('/items/' + id, { method: 'DELETE' })).status, 404);
    const conflict = await call('/items/' + id + '/restore', { method: 'POST' });
    assert.equal(conflict.status, 409);
    assert.equal((await conflict.json()).error, 'RESTORE_CONFLICT');
    assert.equal((await call('/items')).status, 500);
    assert.equal((await call('/health')).status, 500);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('repair upgrades an existing table, preserves rows and can be rerun', async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
    await db.exec("create table items (id uuid primary key default gen_random_uuid(), tenant_id text not null, name text not null, sku text not null, created_at timestamptz not null default now()); insert into items(tenant_id,name,sku) values ('existing','Keep me','ABC');");
    const repair = readFileSync('supabase/migrations/202609070002_repair_existing_items.sql', 'utf8');
    await db.exec(repair);
    await db.exec(repair);
    const row = (await db.query('select * from items')).rows[0];
    assert.equal(row.name, 'Keep me');
    assert.equal(row.deleted_at, null);
    await db.query("select soft_delete_item('existing', $1, 'actor')", [row.id]);
    const restored = (await db.query("select restore_item('existing', $1) as item", [row.id])).rows[0].item;
    assert.equal(restored.id, row.id);
    assert.equal(restored.deleted_at, null);
    await assert.rejects(db.query("insert into items(tenant_id,name,sku) values ('existing','Duplicate','ABC')"), e => e.code === '23505');
  } finally { await db.close(); }
});

test('missing schema returns actionable setup error', async () => {
  const client = { from: () => { throw { code: '42703', message: 'column items.deleted_at does not exist' }; } };
  const server = createApp(client).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const res = await fetch('http://127.0.0.1:' + server.address().port + '/items', { headers: { 'x-tenant-id': 'demo-tenant' } });
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.error, 'DATABASE_SETUP_REQUIRED');
    assert.match(body.message, /202609070002_repair_existing_items.sql/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('repair functions support UUID tenant foreign keys', async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create table tenants(id uuid primary key); create table items(id uuid primary key default gen_random_uuid(),tenant_id uuid references tenants(id),name text,sku text,created_at timestamptz default now());");
    await db.exec(readFileSync('supabase/migrations/202609070002_repair_existing_items.sql','utf8'));
    const tenant = '79000000-0000-4000-8000-000000000079';
    await db.query('insert into tenants values ($1)', [tenant]);
    const item = (await db.query("insert into items(tenant_id,name,sku) values ($1,'Test','ABC') returning id", [tenant])).rows[0];
    assert.ok((await db.query("select soft_delete_item($1,$2,'actor') as item", [tenant,item.id])).rows[0].item.deleted_at);
    assert.equal((await db.query('select restore_item($1,$2) as item',[tenant,item.id])).rows[0].item.deleted_at,null);
  } finally { await db.close(); }
});

test('legacy uniqueness migration allows deleted SKU reuse', async () => {
 const db=new PGlite();
 try {
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  await db.exec(readFileSync('supabase/migrations/202609070001_soft_delete.sql','utf8'));
  await db.exec('alter table items add constraint items_tenant_id_sku_key unique(tenant_id,sku);');
  await db.exec(readFileSync('supabase/migrations/202609070003_fix_legacy_uniqueness.sql','utf8'));
  await db.exec("insert into items(tenant_id,name,sku,deleted_at) values ('a','Deleted','ABC',now()); insert into items(tenant_id,name,sku) values ('a','Live','ABC');");
  await assert.rejects(db.query("insert into items(tenant_id,name,sku) values ('a','Duplicate','ABC')"),e=>e.code==='23505');
 } finally {await db.close();}
});
