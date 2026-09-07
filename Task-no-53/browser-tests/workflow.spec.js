import { test, expect } from '@playwright/test';
const project = 'https://relay-test.supabase.co';
const user = { id: '12345678-1234-1234-1234-123456789abc', email: 'operator@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: { role: 'operator' }, user_metadata: {}, created_at: new Date().toISOString() };
function token() { const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url'); return encode({ alg: 'HS256', typ: 'JWT' }) + '.' + encode({ sub: user.id, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, app_metadata: user.app_metadata }) + '.test'; }
async function mockSupabase(page) {
  const rows = [];
  let failedInserts = false;
  await page.route(`${project}/**`, async route => {
    const request = route.request(), url = new URL(request.url());
    const reply = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/auth/v1/settings') return reply({ external: { email: true }, disable_signup: true });
    if (url.pathname === '/auth/v1/token') return reply({ access_token: token(), token_type: 'bearer', expires_in: 3600, refresh_token: 'test-refresh', user });
    if (url.pathname === '/auth/v1/user') return reply(user);
    if (url.pathname === '/auth/v1/logout') return reply({});
    if (url.pathname === '/rest/v1/contacts') {
      if (request.method() === 'GET') return reply([...rows].reverse());
      if (failedInserts) return reply({ message: 'Email automation is not configured. Add Vault secrets.', code: 'P0001' }, 400);
      const payload = request.postDataJSON();
      rows.push({ ...payload, id: crypto.randomUUID(), status: 'queued', attempts: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), duration_ms: null, email_id: null, last_error: null });
      return reply(null, 201);
    }
    if (url.pathname === '/rest/v1/rpc/retry_contact_email') {
      const row = rows.find(row => row.id === request.postDataJSON().contact_id);
      row.status = 'queued'; row.last_error = null; row.updated_at = new Date().toISOString();
      return reply(null);
    }
    throw new Error(`Unexpected Supabase request: ${request.method()} ${url.pathname}`);
  });
  return { rows, failInserts: () => { failedInserts = true; } };
}
async function connectAndSignIn(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect project', exact: true }).click();
  await page.getByLabel('Project URL', { exact: true }).fill(project);
  await page.getByLabel('Publishable / anon key').fill('sb_publishable_test');
  await page.getByRole('button', { name: 'Test & save connection' }).click();
  await page.getByRole('heading', { name: 'Sign in to Relay' }).waitFor();
  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('dialog').getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Live database', { exact: false }).first()).toBeVisible();
}
test('empty state, secret rejection, escape handling and mobile layout', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'No contacts yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Connect project', exact: true }).click();
  await page.getByLabel('Project URL', { exact: true }).fill(project);
  await page.getByLabel('Publishable / anon key').fill('sb_secret_private');
  await page.getByRole('button', { name: 'Test & save connection' }).click();
  await expect(page.getByRole('alert')).toContainText('never a secret key');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Edge Functions' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('connect, sign in, insert, persist, filter, export, retry, source, and sign out', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const api = await mockSupabase(page);
  await connectAndSignIn(page);
  await page.getByRole('button', { name: 'Insert record', exact: true }).click();
  await page.getByLabel('Full name').fill('Jamie Smith');
  await page.getByLabel('Email address').fill('jamie@example.com');
  await page.getByRole('button', { name: 'Insert & send welcome email' }).click();
  await expect(page.getByRole('cell', { name: 'jamie@example.com', exact: true })).toBeVisible();
  expect(api.rows).toHaveLength(1);
  await page.reload();
  await expect(page.getByRole('cell', { name: 'jamie@example.com', exact: true })).toBeVisible();
  const row = api.rows[0];
  Object.assign(row, { status: 'failed', attempts: 1, updated_at: new Date(Date.now() - 120000).toISOString(), first_attempt_at: new Date(Date.now() - 120000).toISOString(), last_error: 'Provider unavailable', duration_ms: 300 });
  await page.getByRole('button', { name: 'Refresh records' }).click();
  await expect(page.getByRole('cell', { name: 'Failed', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View event for jamie@example.com' }).click();
  await expect(page.getByRole('dialog')).toContainText('Provider unavailable');
  await page.getByRole('button', { name: 'Retry email' }).click();
  await expect(page.getByRole('dialog').getByText('Queued', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Logs', exact: false }).filter({ hasText: /^Logs/ }).click();
  await page.getByRole('textbox', { name: 'Search records' }).fill('nonexistent');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search records' }).fill('jamie');
  await page.getByRole('combobox', { name: 'Filter status' }).selectOption('accepted');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Filter status' }).selectOption('all');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('relay-contacts.csv');
  Object.assign(row, { status: 'accepted', email_id: 'email-confirmed', duration_ms: 240 });
  await page.getByRole('button', { name: 'Refresh records' }).click();
  await expect(page.getByRole('cell', { name: 'Accepted', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View event for jamie@example.com' }).click();
  await expect(page.getByRole('dialog')).toContainText('email-confirmed');
  await expect(page.getByRole('button', { name: 'Retry email' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Overview', exact: true }).first().click();
  await page.screenshot({ path: 'test-results/relay-dashboard.png', fullPage: true });
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.locator('pre')).toContainText('createHandler');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('button', { name: 'Overview', exact: true }).first().click();
  await expect(page.getByRole('cell', { name: 'jamie@example.com', exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('insert errors stay visible and never create a fake successful row', async ({ page }) => {
  const api = await mockSupabase(page); await connectAndSignIn(page); api.failInserts();
  await page.getByRole('button', { name: 'Insert record', exact: true }).click();
  await page.getByLabel('Full name').fill('Jamie');
  await page.getByLabel('Email address').fill('jamie@example.com');
  await page.getByRole('button', { name: 'Insert & send welcome email' }).click();
  await expect(page.getByRole('alert')).toContainText('Vault secrets');
  await expect(page.getByRole('dialog')).toBeVisible(); expect(api.rows).toHaveLength(0);
});
