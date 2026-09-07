# Task 77 — Optimistic-locking update system

| Task | Coverage |
| --- | --- |
| Build an optimistic-locking update system | Concurrent edits, document versions, conflict responses |

React + Vite frontend, Express API, and Supabase PostgreSQL persistence. No MongoDB or replica set is needed.

## Setup

1. Install Node.js 22.12 or newer.
2. Create a Supabase project. Run `supabase/migrations/001_documents.sql` once in its SQL Editor. This creates the documents table and atomic update RPC.
3. From this directory, run `npm install`.
4. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`).
5. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` using your project's URL and server-side service-role key.
6. Run `npm run dev` to start the API and frontend together (API: http://127.0.0.1:4077).
7. Open the frontend URL printed by Vite (normally http://localhost:5173). For separate terminals, use `npm run server` and `npm run client`.

The service-role key belongs only in the backend environment. Never prefix it with `VITE_` or put it in browser code. Leave `VITE_API_BASE_URL` blank to use the same-origin `/api` proxy, which forwards to the backend on `PORT`. Set it only when hosting the API separately; `PORT` and `CLIENT_ORIGIN` control the backend port and allowed browser origin.

This is a local concurrency demo. The API binds to loopback. The `x-tenant-id` header is a demo namespace, **not authentication**; anyone who can call the API can choose it. Before exposing this service, add verified authentication and derive tenant identity from it. RLS is enabled with no browser policies, and table/RPC access is restricted to the backend service role. That role bypasses RLS; API operations explicitly scope every query by tenant.

## Try concurrent edits

1. Click **Create shared document**. Both editor panes load version 1.
2. Change Editor A's body and save. Its version becomes 2.
3. Change Editor B's body and save. It still submits version 1, so the API returns **409 Conflict**.
4. Editor B keeps its draft and displays the current server body and version.
5. Choose **Rebase and keep my draft**, optionally merge the text, then save. The save uses the displayed server version and can conflict again if someone else saved meanwhile.
6. Alternatively, choose **Discard mine and take theirs** to load the server body.

The URL contains the document ID so it can be reopened or shared with another tab. Creating a document is an explicit action; page reloads do not create extra documents.

## How locking works

Documents start at version 1. Every accepted PATCH increments the version exactly once, including a save with unchanged text. The client submits the version it originally read.

The Supabase `update_document` function performs one conditional SQL UPDATE matching `id`, `tenant_id`, and the expected `version`, while incrementing `version` in that same statement. Two simultaneous saves based on the same version cannot both succeed. A failed match returns either a tenant-scoped current document (conflict) or not found. No application-level read-then-write gap exists.

Conflict snapshots can themselves become stale after the response. Rebasing never bypasses the next version check. Versions are counters; this task does not store a full revision history.

## API

All document endpoints require `Content-Type: application/json` when sending JSON and `x-tenant-id: demo-tenant`.

| Method and path | Request | Response |
| --- | --- | --- |
| GET /health | None | 200 liveness response |
| POST /documents | `{"title":"Shared","body":"Hello","editedBy":"Alice"}` | 201 document, version 1 |
| GET /documents/:id | None | 200 document |
| PATCH /documents/:id | `{"version":1,"body":"Updated","editedBy":"Bob"}` | 200 document with incremented version |

Document shape: `{ id, title, body, version, lastEditedBy, updatedAt }`.
PATCH accepts any subset of title, body, and editedBy, with at least one supplied. Unknown fields are rejected. Titles must be nonblank and at most 200 characters; body is limited to 100,000 characters and editedBy to 100. Versions must be positive integers below 2,147,483,647. IDs must be UUIDs.

Example conflict response (HTTP 409):

```json
{
  "error": "CONFLICT",
  "message": "This document changed since you loaded it.",
  "yourVersion": 1,
  "current": {
    "id": "00000000-0000-4000-8000-000000000001",
    "title": "Shared",
    "body": "Alice's saved text",
    "version": 2,
    "lastEditedBy": "Alice",
    "updatedAt": "2026-09-07T10:00:00Z"
  }
}
```

Other responses: 400 invalid input/JSON/ID/version, 401 missing demo tenant, 404 missing document (including another tenant's document), 413 oversized payload, and 500 database failure. Failed requests leave the editor draft intact. The health endpoint checks API liveness, not database connectivity.

## Verification

- `npm test`: HTTP validation and response tests using an injected store; no database required.
- `npm run test:integration`: real Supabase integration test. Requires the migration and populated `.env`; otherwise it is reported as skipped. It creates an isolated test document, issues two PATCH requests concurrently, asserts exactly one 200 and one 409, verifies stored content and versions, tests stale writes, rebasing, tenant isolation and missing IDs, then deletes its test data.
- `npm run build`: production frontend build.
- `npm start`: backend without file watching.
- `npm run preview`: preview the built frontend; configure `CLIENT_ORIGIN` for the preview origin and restart the API.

## Files

- `supabase/migrations/001_documents.sql`: schema, privileges, atomic update function.
- `db.js`, `models/EditableDoc.js`: server-only Supabase client and persistence.
- `server.js`, `routes/documents.js`: HTTP API and validation.
- `src/components/OptimisticEditor.jsx`: draft preservation and conflict resolution.
- `test/`: API and live concurrency tests.

Supabase references: [Database functions](https://supabase.com/docs/guides/database/functions), [JavaScript RPC](https://supabase.com/docs/reference/javascript/rpc).


## Troubleshooting connection errors

If the editors report that the document service is unavailable, check the API terminal. The server requires a local `.env` containing real Supabase credentials and the SQL migration must have been applied. After configuring it, restart `npm run dev`. Run `npm run test:integration` to verify the database connection and concurrent saves.

Document IDs are UUIDs generated by Supabase, not numbers such as `1002`. Click **Create shared document** to obtain a valid ID, or paste an existing document UUID. Invalid IDs in the URL or form are rejected before editor requests are sent.

Vite development and preview both proxy `/api` requests. For a separately hosted production frontend, configure an equivalent reverse proxy or set `VITE_API_BASE_URL` before building and allow that frontend origin with `CLIENT_ORIGIN`.