# Task 78 - Multi-tenant data isolation layer

A runnable React + Express application using **Supabase Postgres and Supabase Auth**. MongoDB and Mongoose are not required.

| Requirement | Implementation |
| --- | --- |
| Tenant IDs | UUID tenants, membership records, required foreign key on every item |
| Query scoping | Item repository injects the authenticated tenant into inserts and filters every read, update, and delete |
| Middleware | Verifies bearer tokens through Supabase Auth, checks database membership, and establishes request-local AsyncLocalStorage context |
| Security boundaries | Postgres row-level security (RLS), restricted column privileges, immutable item tenant IDs, and no client membership administration |

## Prerequisites

- Node.js 22.12 or newer and npm.
- A Supabase project with email/password authentication enabled.
- Two confirmed Supabase Auth users for demonstrating isolation.

## Setup

1. Run `npm install` in this directory.
2. Copy `.env.example` to `.env`. Set both Supabase URLs to your project URL and both key variables to its **publishable key** (a legacy anon key also works). Never use a secret or service-role key. VITE variables are public browser configuration.
3. Run `supabase/migrations/202609070001_tenant_isolation.sql` once in the Supabase SQL Editor, as the database administrator. This creates the tables, grants, indexes, and policies in a transaction. The migration expects these table names to be unused.
4. In Supabase Authentication, create two confirmed users with email/password credentials. Copy their user UUIDs.
5. Run the provisioning SQL below, replacing the user UUID placeholders with those actual IDs.
6. Start the API with `npm run server`. In a second terminal run `npm run dev`. Open http://localhost:5173.

Both commands run from this directory; there are no separate backend/frontend folders. The API listens on port 4058. Vite proxies /api to that API; if changing the API port, update the proxy target in vite.config.js.

### Provision demo tenants and memberships

Only trusted database administrators provision or revoke memberships. Never expose this SQL through a public endpoint.

```sql
insert into public.tenants (id, name) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Tenant A'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Tenant B');

-- Replace these placeholders with IDs from Authentication > Users.
insert into public.tenant_memberships (tenant_id, user_id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '<USER_A_UUID>'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '<USER_B_UUID>');
```

Sign in as user A in Session A and user B in Session B. Each panel has its own in-memory Supabase session; reloading requires signing in again. Add items in either panel and refresh the other. The same SKU can exist in different tenants, but duplicates within one tenant return 409.

A user can belong to multiple tenants and select among them. The tenant header is a **selection**, never proof of authorization. Changing it to a tenant without membership returns 403.

## API

Every item endpoint requires:
- `Authorization: Bearer <Supabase access token>`
- `x-tenant-id: <tenant UUID>`

| Method | Path | Behavior |
| --- | --- | --- |
| GET | /health | Process liveness only; does not check database connectivity |
| GET | /items | List items in the selected authorized tenant |
| POST | /items | Create with JSON name and sku; returns 201 |
| PUT | /items/:id | Replace name and sku of a scoped item |
| DELETE | /items/:id | Delete a scoped item |

The browser uses /api/items through the development proxy. POST and PUT accept **only** name (1-200 trimmed characters) and sku (1-100 trimmed characters). Tenant fields, IDs, and other extra fields are rejected. Item IDs are UUIDs. Missing/invalid authentication returns 401, malformed input 400, unauthorized tenant selection 403, and missing or cross-tenant target IDs 404. Internal errors do not expose database details.

## How isolation works

1. Middleware validates the access token with `auth.getUser(token)`; it never trusts decoded claims or a caller-supplied user ID.
2. A fresh Supabase client carries that user's bearer token. The API uses a publishable key so it cannot bypass RLS.
3. The membership lookup checks the verified user's ID against the selected tenant. Membership changes apply to subsequent database operations.
4. AsyncLocalStorage keeps each request's client and tenant separate during concurrent traffic. Repository calls without authenticated context fail closed.
5. Repository queries always scope by tenant. Inserts take their tenant from context, not the body.
6. Database RLS checks membership independently, including calls made directly to Supabase. Users can read only their own membership rows; they cannot create tenants or alter memberships.
7. Column grants permit updating only name and sku, preventing reassignment of an item to another tenant, even for users who belong to both.

Members have equal item CRUD permissions in their tenants. RLS permits direct database access to **all tenants a user belongs to**; the API additionally scopes each request to one selected tenant. Database administrators and service roles remain trusted and can bypass RLS. No service-role credentials belong in this app.

See the official [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) and [getUser reference](https://supabase.com/docs/reference/javascript/auth-getuser).

## Verification

```sh
npm test
npm run build
```

The automated API tests use a fake Supabase client to verify middleware authorization, query scoping, hostile input, concurrent requests, and error handling without credentials. A separate embedded Postgres (PGlite) test executes the migration and SQL isolation script with Supabase-compatible auth roles and an auth.uid() stub. These checks do not prove the configuration of a deployed Supabase project. Run `supabase/tests/isolation.sql` in the SQL Editor after applying the migration to exercise real Postgres policies and privileges. It uses temporary fixtures inside a transaction and rolls back.

Also verify with the two real users:
- Add the same SKU to both tenants and confirm independent rows.
- Send user A's token with tenant B's header: expect 403.
- Send user A's token and tenant A's header when deleting/updating an item ID from B: expect 404.
- Supply tenant_id in a create body: expect 400.
- Revoke A's membership as administrator; A's next item request must return 403.

## Deployment and scope

`npm run build` creates dist; `npm start` runs the API. Serve dist with a production web server and proxy /api/* to the API with the /api prefix removed. Vite's development proxy is not included in the build. Configure HTTPS and the environment variables before deploying; only publishable configuration may enter browser builds.

This is a fresh-schema migration, not an automatic importer for existing MongoDB data. If preserving old data, explicitly map old tenant/item IDs to UUIDs and provision Auth memberships before importing through a trusted administrative process.
