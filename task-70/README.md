# Task 80: Build an API request deduplication layer

A React + Vite demo backed by Express and **Supabase PostgreSQL**. It demonstrates duplicate frontend requests, caching, cancellation, and race conditions. The original in-memory item store has been replaced with persistent Supabase reads and inserts; MongoDB is not used.

## Setup

Use Node.js 22.12+ (or Node 24) and npm. Run all commands from the task-80 directory; there are no separate frontend/backend packages.

1. Create a Supabase project. Run `supabase/schema.sql` in its SQL Editor. This creates the dedicated public.task80_items table, enables RLS, grants server access, and seeds Widget and Gadget. The seed is safe to rerun.
2. Copy the environment template:

   ```powershell
   Copy-Item .env.example .env
   ```

   On macOS/Linux use `cp .env.example .env`.
3. Edit `.env`: set `SUPABASE_URL` to your project URL and `SUPABASE_SECRET_KEY` to its server secret key (a legacy service-role key also works). The alternative name `SUPABASE_SERVICE_ROLE_KEY` is supported. Never prefix this key with `VITE_` or put it in frontend code. See [Supabase client initialization](https://supabase.com/docs/reference/javascript/initializing).
4. Install dependencies and start both the API and frontend from one terminal:

   ```sh
   npm ci
   npm run dev
   ```

   Keep this terminal open. Stop both servers with Ctrl+C. For separate terminals, use npm run server and npm run dev:ui instead.

Open http://localhost:5173. The Vite proxy forwards `/api` to http://127.0.0.1:4080. If you change PORT, also change the proxy target in `vite.config.js`.

## Try the task requirements

| Requirement | Demonstration / expected result |
| --- | --- |
| Duplicate frontend requests | Choose burst size 5. Without dedup: 5 GET hits. With dedup: 1 GET hit shared by all five callers. |
| Caching | Test cache makes two sequential reads; the second is served from the 2-second client cache. Clear cache forces a future network read. |
| Cancellation | Test shared cancellation cancels one subscriber twice; the other still completes. Cancel search stops the current hook request. |
| Race conditions | Quickly type a name. Searches shorter than three characters wait 1.2 seconds; longer searches wait 0.1 seconds. Only the latest call updates the results. |
| Supabase persistence | Add a unique SKU, reload, and search for it. The item remains after an API restart. Duplicate SKUs return 409. |

Delays occur before the database query, so actual latency also depends on Supabase. Results show up to 100 matching items. Search is case-insensitive by name; percent and underscore are treated literally.

The counter records accepted GET /api/items arrivals, including cancelled or failed reads. It lives in the API process and resets on restart. Burst results compare counts before and after the experiment; simultaneous searches or another tab can add hits. Reset with no work pending for a clean comparison.

## Request layer contract

`src/api/httpClient.js` exports `request(url, options)`, returning `{ promise, cancel, deduped, fromCache }`.

- Only GET requests are deduplicated and cached. Identity uses method, exact URL, and normalized headers (including authorization). Different query-string ordering intentionally counts as a different URL. Calls share flights only when their TTL policies match.
- Each caller gets its own promise. Cancelling rejects that caller with AbortError immediately. Cancellation is idempotent; only the last active subscriber aborts the underlying fetch.
- `cacheTtlMs` defaults to 2000. Zero disables cache reads and writes for that call. `skipCache: true` bypasses cached responses but can still join an identical flight and populate the cache. `dedupe: false` disables sharing; combine with skipCache for a network comparison.
- Cache entries expire and are bounded to 100. Failed and cancelled responses are never cached. Headers isolate cached authorization contexts.
- Successful non-GET calls clear the read cache and detach older flights. Explicit `clearResponseCache()` does the same. Old callers may still finish, but cannot repopulate the invalidated cache. Among independent same-key reads, only the most recently started request may populate the cache.
- This client supports JSON request bodies and JSON/text responses. It does not deduplicate writes or provide server-side idempotency.
- `useDedupedRequest()` exposes data, error, loading, call, and cancel. It cancels on unmount and uses generation checks to ignore superseded outcomes. Errors are exposed in hook state; call resolves undefined on cancellation, failure, or a stale outcome.

React StrictMode cleanup safely detaches subscribers. If cleanup removes the last subscriber, a subsequent mount starts a replacement request; StrictMode does not guarantee exactly one server arrival.

## API

| Method | Route | Behavior |
| --- | --- | --- |
| GET | /api/items?q=Widget&delayMs=800 | Read Supabase items; optional name filter and 0–3000 ms delay |
| POST | /api/items | Insert JSON `{ "name": "Part", "sku": "PART-1" }`; returns 201 |
| GET | /api/request-count | Current process-local item-read counter |
| POST | /api/reset-count | Reset the counter |

Name is required (1–120 characters); SKU is required (1–80). The API returns JSON validation/database errors and forwards read cancellation to the Supabase query. Cancellation cannot undo a write already accepted by the database.

This is a local teaching app: the API binds to loopback and has no user authentication. The table denies direct anon/authenticated access; the Express server uses its private privileged key. Add authentication and per-user authorization before exposing the API publicly.

## Checks and build

```sh
npm test
npm run build
npm run preview
```

Preview serves the build and proxies /api to the running backend. The automated tests cover shared requests, TTL expiry, authorization isolation, independent cancellation, old/new flight cleanup races, cache invalidation after writes, HTTP errors, React latest-result/unmount behavior, and the Express/Supabase contract using a mocked database client.

Live Supabase verification requires your own configured project; the tests do not contact a real database. A missing schema or invalid credentials produces an actionable error in the demo.

## Files

- `src/api/httpClient.js`: reusable request layer
- `src/hooks/useDedupedRequest.js`: React lifecycle and latest-result handling
- `src/components/DedupDemo.jsx`: experiments, search, and item creation
- `server.js`: private Supabase client and API startup
- `server/app.js`: testable Express routes
- `supabase/schema.sql`: table, access rules, seed data
- `tests/`: regression tests


## Existing items tables / tenant_id errors

This demo uses public.task80_items, not public.items. A shared Supabase project may already have an items table with required tenant_id columns or other incompatible constraints. CREATE TABLE IF NOT EXISTS does not change that layout.

Run the entire current supabase/schema.sql script, then restart the API with npm run server. Both backend reads and inserts now use task80_items; the frontend routes remain /api/items. No tenant ID or changes to your existing items table are needed. Existing records are not copied or deleted. The seed can be rerun safely.
