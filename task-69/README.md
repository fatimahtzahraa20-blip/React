# Task 79: Build a Soft-Delete + Restore Architecture

| Task | Required coverage |
| --- | --- |
| Build a soft-delete + restore architecture | Deleted records, indexes, restore rules, query abstractions |

## Objective

Implement a Supabase PostgreSQL architecture that retains deleted records, hides them from normal queries, and restores them without violating uniqueness rules.

The project includes a React interface with Live items and Trash, an Express API, SQL migrations, and automated tests.

## 1. Deleted Records

Soft deletion updates an item instead of removing its database row.

| Field | Purpose |
| --- | --- |
| id | Stable UUID retained after deletion and restore |
| tenant_id | Ownership scope for queries and mutations |
| name / sku | Item data preserved in trash |
| created_at | Original creation timestamp |
| updated_at | Timestamp maintained by a database trigger |
| deleted_at | NULL for live records; deletion timestamp for deleted records |
| deleted_by | Optional actor responsible for deletion |

Normal queries exclude deleted records. The trash view explicitly includes only deleted records. Restoring a record clears deleted_at and deleted_by.

The HTTP API supplies the deletion timestamp from the application server. Records remain in trash indefinitely. There is no hard-delete endpoint, automatic purge, or cascading deletion. Deletion metadata tracks the current deletion rather than a permanent audit history.

## 2. Indexes

| Index | Definition and purpose |
| --- | --- |
| items_live_tenant_sku | Unique (tenant_id, sku) for live records only |
| items_live_listing | (tenant_id, created_at DESC, id) for live-record queries |
| items_trash_listing | (tenant_id, created_at DESC, id) for trash queries |
| items_all_listing | (tenant_id, created_at DESC, id) for queries including deleted records |

The partial unique index is the central database rule:

```sql
create unique index items_live_tenant_sku
on public.items (tenant_id, sku)
where deleted_at is null;
```

This allows a deleted item's SKU to be reused while preventing two live items in the same tenant from sharing it. Different tenants can use the same SKU. SKU comparison is case-sensitive; creation trims surrounding whitespace.

## 3. Restore Rules

1. Only a deleted item belonging to the current tenant can be restored.
2. A successful restore clears both deletion fields and retains the original UUID and item data.
3. If another live item in that tenant uses the same SKU, restore returns **409 RESTORE_CONFLICT**.
4. A conflicting restore leaves the deleted record unchanged.
5. A missing item, an item in another tenant, or an item already in the requested state returns **404**.

Delete and restore each use one conditional PostgreSQL UPDATE through the Supabase Data API. Filters include the tenant, item UUID, and required deletion state. The database unique index handles competing creates and restores atomically, without an application-level check-then-save race.

The migrations also provide optional soft_delete_item and restore_item RPCs compatible with text or UUID tenant columns. The HTTP repository uses direct filtered updates rather than these functions.

## 4. Query Abstractions

[ItemRepository](models/Item.js) requires a tenant and excludes deleted records by default. [applyVisibility](plugins/softDelete.js) centralizes visibility filters.

```javascript
const repository = new ItemRepository(supabase, tenantId);

await repository.list();               // Live records
await repository.onlyDeleted().list(); // Deleted records
await repository.withDeleted().list(); // All records
```

The helpers return new repository instances and preserve tenant scope. Create requests cannot override ownership or deletion metadata.

Lists use created_at descending and id ascending, with limit/offset pagination. The UI fetches all pages. Concurrent changes can shift offset pagination; refresh after mutations.

## Run the Project

Requires Node.js 22.12+ and a Supabase project. Run commands from the task-79 directory.

### Install

```powershell
npm install
```

### Apply the database migration

In **Supabase > SQL Editor**, copy and run the entire file appropriate for your database:

| Database state | Migration |
| --- | --- |
| No items table exists | [001: Initial schema](supabase/migrations/202609070001_soft_delete.sql) |
| Existing items table needs soft-delete support | [002: Repair existing table](supabase/migrations/202609070002_repair_existing_items.sql) |
| Soft-delete columns exist, but the legacy constraint still blocks SKU reuse | [003: Fix legacy uniqueness](supabase/migrations/202609070003_fix_legacy_uniqueness.sql) |

Migration 001 is for a fresh table. Migration 002 preserves existing records, can be rerun, and includes the legacy uniqueness fix. Migration 003 is a focused follow-up for projects using an older repair.

The repair expects existing id (UUID), tenant_id (text or UUID), name, sku, and created_at columns. Duplicate live tenant/SKU pairs prevent index creation and roll back the migration; resolve them before retrying. Unrelated existing constraints remain in place.

Saving a SQL file locally does not apply it to Supabase.

### Configure the demo tenant

The demo header demo-tenant maps to UUID 79000000-0000-4000-8000-000000000079.

Only if your existing items.tenant_id references tenants.id, run:

```sql
insert into public.tenants (id, name)
values ('79000000-0000-4000-8000-000000000079', 'Task 79 demo')
on conflict (id) do nothing;
```

The fresh task-79 schema uses a text tenant column without a tenants foreign key and does not require this seed. Other tenant header values pass through unchanged.

### Configure and start

If .env does not already exist:

```powershell
Copy-Item .env.example .env
```

Set credentials for the same Supabase project where you applied the SQL:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
PORT=4079
```

```powershell
npm run dev
```

- Frontend: http://localhost:5173
- API health: http://127.0.0.1:4079/health

Vite proxies /api requests to Express. If PORT changes, update [vite.config.mjs](vite.config.mjs) too. Restart after editing .env. The health check verifies connectivity and required columns, not every index or restore rule.

## Demonstrate the Task

| Item | Name | SKU |
| --- | --- | --- |
| Original | Wireless Mouse | MOUSE-001 |
| Replacement | Wireless Mouse V2 | MOUSE-001 |

1. Create Wireless Mouse.
2. Soft-delete it and confirm it moves from Live items to Trash with deletion metadata.
3. Create Wireless Mouse V2 using the same SKU.
4. Restore the original: expect a 409 conflict and no change to its deleted state.
5. Soft-delete the replacement.
6. Restore the original: expect success and cleared deletion metadata.
7. Refresh the browser to confirm persistence.

Choose another SKU if MOUSE-001 already belongs to a live item.

## API

All item routes require x-tenant-id. Optional x-user-id records the deletion actor. The UI uses demo-tenant and demo-user.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /health | Check database access and required columns |
| GET | /items | List live records |
| GET | /items/trash | List deleted records |
| GET | /items/all | List both states |
| POST | /items | Create an item; returns 201 |
| DELETE | /items/:id | Soft-delete a live item |
| POST | /items/:id/restore | Restore a deleted item |

Create body:

```json
{ "name": "Wireless Mouse", "sku": "MOUSE-001" }
```

Name must contain 1-200 characters and SKU 1-100 after trimming. Lists return arrays and accept limit (1-100, default 100) and offset (nonnegative, default 0).

Responses use 400 for invalid input, 404 for no matching item/state, 409 for uniqueness or tenant-reference conflicts, 503 for missing schema objects, and 500 for unexpected database failures.

## Verification

```powershell
npm test
npm run build
```

The automated tests cover deletion and restore, uniqueness conflicts, query scopes, tenant isolation, permissions, API errors, repair reruns, UUID tenant compatibility, and legacy constraint repair. Tests use PGlite and mocks without Supabase credentials.

Run the demo scenario against your Supabase project after applying migrations to verify its actual configuration.

## Troubleshooting

| Problem | Action |
| --- | --- |
| Missing deleted_at or updated_at | Apply migration 002 |
| items already exists when running migration 001 | Use migration 002 |
| Deleted SKU still conflicts with items_tenant_id_sku_key | Apply migration 003 |
| TENANT_NOT_FOUND | Seed the demo tenant if a tenants foreign key exists |
| Invalid UUID for demo-tenant | Restart the current backend to activate the alias mapping |
| Database request failed | Read the Express terminal error and check the configured project's schema |
| Invalid key or connection failure | Correct .env and restart |

Schema changes must run in the SQL Editor; the service role API key cannot execute arbitrary migration SQL through the Data API.

## Scope and Security

This is a local demo. Tenant and actor headers are not authentication. Production use requires verified authentication and tenant-membership authorization.

Express binds to loopback. The service role key stays on the backend. RLS is enabled, browser-role access is revoked, and the service role receives select/insert/update with delete/truncate revoked. Because the service role bypasses RLS, repository filters enforce application tenant scope.

npm start runs only the API. npm run preview serves only the frontend build and does not provide the development API proxy. Deployment requires a same-origin /api reverse proxy.

## Main Files

| File | Responsibility |
| --- | --- |
| [models/Item.js](models/Item.js) | Tenant-scoped queries and atomic mutations |
| [plugins/softDelete.js](plugins/softDelete.js) | Live, trash, and all-record filters |
| [routes/items.js](routes/items.js) | HTTP routes and validation |
| [middleware/tenant.js](middleware/tenant.js) | Demo tenant resolution |
| [db.js](db.js) | Supabase client and schema check |
| [server.js](server.js) | API startup and error handling |
| [SoftDeleteDemo.jsx](src/components/SoftDeleteDemo.jsx) | Live/trash interface |
| [test/soft-delete.test.js](test/soft-delete.test.js) | Regression coverage |
