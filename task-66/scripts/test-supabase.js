require('dotenv').config();
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const { TEST_SUPABASE_URL, TEST_SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!TEST_SUPABASE_URL || !TEST_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Set TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_ROLE_KEY for a dedicated test project.');
  }
  const client = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } });
  const tenant = 'test-' + randomUUID();
  console.log('Test tenant (records retained):', tenant);
  async function pay(key, amount = 100) {
    const { data, error } = await client.rpc('create_payment', {
      p_tenant_id: tenant, p_key: key, p_account_id: 'account',
      p_amount_cents: amount, p_currency: 'USD',
    });
    if (error) throw error;
    return data;
  }
  const duplicates = await Promise.all(Array.from({ length: 20 }, () => pay('duplicate')));
  for (const result of duplicates) {
    assert.equal(result.status_code, 201);
    assert.deepEqual(result.body, duplicates[0].body);
  }
  assert.equal(duplicates.filter(r => !r.replayed).length, 1);
  const distinct = await Promise.all(Array.from({ length: 10 }, (_, i) => pay('distinct-' + i)));
  distinct.forEach(result => assert.equal(result.status_code, 201));
  assert.equal((await pay('duplicate', 200)).status_code, 422);
  const { data: account, error: accountError } = await client.from('payment_accounts')
    .select('balance_cents').eq('tenant_id', tenant).eq('account_id', 'account').single();
  if (accountError) throw accountError;
  assert.equal(Number(account.balance_cents), -1100);
  const { count, error } = await client.from('payment_orders').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant);
  if (error) throw error;
  assert.equal(count, 11);
  console.log('Hosted Supabase concurrency checks passed.');
}
main().catch(err => { console.error(err.message); process.exitCode = 1; });
