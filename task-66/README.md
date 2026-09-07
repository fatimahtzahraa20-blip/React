# Task 76: Idempotent Payment and Order Creation

Build an endpoint that safely handles duplicate payment requests, retries, and race conditions. This implementation uses **Supabase (PostgreSQL)** for persistence and transactions, with an Express API and a React interface.

## Task requirements

| Requirement | Implementation |
| --- | --- |
| Idempotency keys | Each logical payment uses an `Idempotency-Key` header, scoped to its tenant. |
| Duplicate requests | Identical retries return the original response without creating another order or debit. |
| Payload conflicts | Reusing a key with a different valid payload returns HTTP 422. |
| Atomic transactions | Order creation, ledger debit, and replay response are committed together by one PostgreSQL function. |
| Race conditions | Transaction-scoped advisory locks, account row locks, and unique constraints protect concurrent requests. |
| Safe retries | Network or temporary database failures preserve the key so clients can safely retry. |

## Technology stack

- Frontend: React and Vite
- Backend: Node.js and Express
- Database: Supabase PostgreSQL
- Database access: Supabase JavaScript client and a PL/pgSQL RPC function
- Tests: Node.js test runner, Supertest, and PGlite

## Setup

### 1. Install dependencies

Requires Node.js 22.12 or later and a Supabase project.

```sh
npm install
```

### 2. Create the database tables and function

Open your Supabase project's SQL Editor and run the complete migration once:

```text
supabase/migrations/202609070001_create_payments.sql
```

It creates these tables and the `create_payment` function:

| Table | Purpose |
| --- | --- |
| `payment_accounts` | Stores each tenant/account ledger balance in cents. |
| `payment_orders` | Stores paid orders and their idempotency keys. |
| `payment_idempotency` | Stores the original request and response for replay. |

The migration enables row-level security and restricts payment access to the backend service role. Run it against a fresh schema; it is not intended to be applied repeatedly through the SQL Editor.

### 3. Configure the backend

Create a `.env` file in the project root. If it already contains your project settings, keep them.

```dotenv
PORT=4076
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The backend reads **`.env`**, not `.env.example`. Keep credentials out of committed files and browser code. Never prefix the service-role key with `VITE_`.

### 4. Start the application

```sh
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4076
- Health endpoint: http://localhost:4076/health

Vite forwards payment requests to the API. The backend checks its Supabase connection before listening.

## Using the interface

1. Enter an account and a positive USD amount with at most two decimal places.
2. Select **Pay** to create the order and debit the ledger.
3. After a temporary failure, select **Retry same payment**. The original key is reused automatically.
4. After success, select **Replay same payment** to retrieve the stored response.
5. Select **New payment** to begin a separate payment attempt.

The key is managed internally and is not displayed. Inputs remain locked after submission. Keys are held in memory, so reloading the page does not preserve an earlier attempt.

## API reference

### Create a payment

```http
POST /payments
Content-Type: application/json
x-tenant-id: demo-tenant
Idempotency-Key: payment-attempt-001
```

Request body:

```json
{
  "accountId": "acct_1",
  "amountCents": 2500,
  "currency": "USD"
}
```

- `accountId`: nonblank string, maximum 200 characters.
- `amountCents`: positive JavaScript-safe integer representing cents.
- `currency`: optional; defaults to USD. Only USD is supported.
- Extra body fields are rejected.
- The idempotency key must contain 1–200 printable ASCII characters without spaces.

Example successful response, HTTP **201**:

```json
{
  "orderId": "9d907d54-304e-40ef-8ecb-d79cc18cb954",
  "status": "paid",
  "amountCents": 2500,
  "currency": "USD"
}
```

An identical retry returns the same status and JSON body, with the header `Idempotency-Replayed: true`. The first successful response uses `false`. JSON property order and omitted default currency do not change request identity.

| HTTP status | Meaning |
| --- | --- |
| 201 | Payment created or its original successful response replayed. |
| 400 | Invalid request body, JSON, or idempotency key. |
| 401 | Missing or invalid tenant identifier. |
| 413 | Request body exceeds the 16 KB limit. |
| 422 | Key reused for a different valid payload, or ledger balance limit exceeded. |
| 503 | Temporary service, database, or lock failure. Retry the same key and body after the `Retry-After` delay. |

### PowerShell example

With the API running:

```powershell
$headers = @{
  'x-tenant-id' = 'demo-tenant'
  'Idempotency-Key' = 'payment-attempt-001'
}
$body = @{
  accountId = 'acct_1'
  amountCents = 2500
  currency = 'USD'
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://localhost:4076/payments' -Headers $headers -ContentType 'application/json' -Body $body
```

Run the same request again to replay it. Change the amount while keeping the key to receive a conflict. Use a new key only for a new logical payment.

## How idempotency works

1. Express validates the request and resolves its tenant.
2. It calls the Supabase `create_payment` RPC.
3. PostgreSQL acquires a transaction-scoped lock for the tenant/key pair.
4. If the key already exists, the function compares the payload and returns either the stored response or a conflict.
5. For a new payment, it creates the account if needed and locks its row.
6. It debits the ledger, creates the order, and saves the replay response in one transaction.

A failure rolls back all these writes. If the transaction commits but the response is lost, a retry with the original key retrieves the stored result. Different keys affecting the same account are protected by its row lock. Lock waits are limited to five seconds, after which the caller can retry.

Idempotency records have no expiry and must be retained with their orders.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and Vite together. |
| `npm start` | Start only the API. |
| `npm run dev:client` | Start only the Vite development server. |
| `npm run build` | Build the frontend into `dist/`. |
| `npm run preview` | Preview the frontend build; this does not start the API. |
| `npm test` | Run local SQL and API tests. |
| `npm run test:supabase` | Run concurrency checks against a dedicated Supabase test project. |

## Testing

```sh
npm test
npm run build
```

The local suite runs the actual SQL migration and database function in PGlite, using an adapter for Supabase's HTTP transport. It covers:

- Sequential and simultaneous HTTP duplicates
- Conflicting payloads
- Multiple payments against one account
- Tenant isolation
- Rollback after response persistence fails
- Lost responses after a successful commit
- Balance limits and invalid input
- Database access permissions

PGlite serializes SQL execution. These tests do not establish multi-connection lock behavior on hosted Supabase.

For hosted concurrency checks, apply the migration to a dedicated test project and configure:

```dotenv
TEST_SUPABASE_URL=https://your-test-project-ref.supabase.co
TEST_SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
```

Then run `npm run test:supabase`. The script sends concurrent RPC requests, checks order counts and the ledger, and leaves records under a unique test tenant for inspection.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Cannot reach the payment service | Run `npm run dev` and check that the API is listening on port 4076. |
| Backend reports missing configuration | Put the Supabase URL and server key in the root `.env`, then restart. |
| Supabase startup or payment RPC fails | Check credentials and confirm that the complete migration was applied. |
| Key conflict | Retry the original payload; create a new key only for a separate payment. |
| Frontend runs but payments fail | Start the API too; `npm run dev:client` starts only Vite. |

## Scope

This is a payment-recording demo. It records negative USD ledger debits from an initial zero balance and does not charge an external payment provider.

The `x-tenant-id` header is demo identity. Before public deployment, replace its fallback with verified authentication. External payment-provider calls require their own idempotency design and must not be placed inside a retryable database transaction.

Supabase replaces the original MongoDB implementation. Existing MongoDB data is not migrated automatically; historical orders, balances, and idempotency records must be migrated together if they need to be preserved.
