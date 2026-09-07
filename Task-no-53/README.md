# Task 63: Send an Email on a New Database Insert

## Objective

Create a Supabase Edge Function that automatically sends an email whenever a new record is inserted into a database table. A React application provides the interface for adding contacts and monitoring email processing.

## How It Works

1. An authenticated operator adds a contact through the React app.
2. Supabase inserts the contact into `public.contacts`.
3. A PostgreSQL trigger calls the `send-insert-email` Edge Function.
4. The function verifies the webhook secret and claims the queued record.
5. Resend sends a personalized welcome email to the contact's email address.
6. The function saves the result, and the dashboard refreshes to display it.

Inserts made through the SQL editor or another authorized backend trigger the same automation. The React app does not need to remain open for the function to run.

## Technology Stack

| Component | Technology |
| --- | --- |
| Frontend | React and Vite |
| Database and authentication | Supabase PostgreSQL and Auth |
| Server-side email processing | Supabase Edge Functions with Deno |
| Email provider | Resend |
| Automated tests | Node.js, PGlite, and Playwright |

## Features

- Connect an existing Supabase project using its public URL and key.
- Sign in with an operator account and insert real contact records.
- Automatically send a welcome email after each new insert.
- Track processing status, errors, attempts, execution time, and provider IDs.
- Refresh records automatically every five seconds while the page is visible.
- Search, filter, paginate, and export contact records as CSV.
- Retry failed or stuck email jobs with duplicate-send protection.

## Prerequisites

- Node.js 22.12 or later and npm.
- An existing Supabase project and the Supabase CLI.
- A Resend account, API key, and verified sender domain.
- Microsoft Edge for the default browser tests, or Chrome configured as described below.

## Setup

### 1. Install Dependencies

Run these commands from the project directory:

```sh
npm install
```

### 2. Set Up the Database

Authenticate the Supabase CLI, link your project, and apply the migrations:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Both migrations must be applied in order. They create the contacts table, access policies, email status fields, and insert/retry triggers.

If your project already contains an unrelated `public.contacts` table, review and adapt the migrations before applying them. The migrations install the trigger automatically; a separate manual database webhook is not required.

### 3. Configure and Deploy the Edge Function

Create a private `.env` file in the project root with your server secrets:

```dotenv
RESEND_API_KEY=re_YOUR_RESEND_API_KEY
EMAIL_FROM="Your Team <hello@your-verified-domain.com>"
WEBHOOK_SECRET=YOUR_LONG_RANDOM_SECRET
```

Deploy the secrets and function:

```sh
supabase secrets set --env-file .env
supabase functions deploy send-insert-email
```

Hosted Supabase Edge Functions provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the handler. Keep all private credentials out of React code and variables prefixed with `VITE_`.

### 4. Configure the Trigger and Operator Account

In Supabase **Authentication → Users**, create an email/password user for the application.

Open [supabase/setup.sql](supabase/setup.sql), replace its placeholders, and run it in the Supabase SQL editor. It configures:

| Setting | Value |
| --- | --- |
| `relay_function_url` in Vault | `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-insert-email` |
| `relay_webhook_secret` in Vault | The same value as `WEBHOOK_SECRET` |
| Operator role | The email of the user created above |

Run the Vault creation statements once. When changing existing secrets, update the entries in Supabase Vault. Sign out and back in after assigning or changing the operator role.

### 5. Start and Connect the React App

```sh
npm run dev
```

Open the local URL printed by Vite. Select **Connect project**, enter your Supabase project URL and publishable key (or legacy anon key), then select **Test & save connection**. Sign in with your operator account.

Alternatively, configure the public connection details in `.env.local` and restart Vite:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

The app stores public connection settings in your browser. It does not require a service-role key in the frontend.

## Test the Task

### Using the React App

1. Sign in and select **Insert record**.
2. Enter a name and an email address you control.
3. Select **Insert & send welcome email**.
4. Watch the record move from `queued` to `processing`, then `accepted` or `failed`.
5. Check the recipient inbox and Resend activity for delivery details.

### Using the SQL Editor

After completing the backend setup, insert a contact directly:

```sql
insert into public.contacts (name, email)
values ('Test User', 'YOUR_OWN_TEST_EMAIL');
```

Replace the email placeholder with a real address you control. This insert should trigger the same Edge Function without using the React app.

### Expected Statuses

| Status | Meaning |
| --- | --- |
| `queued` | The contact is waiting for processing. |
| `processing` | The Edge Function has claimed the email job. |
| `accepted` | Resend accepted the email request. |
| `failed` | An email attempt failed; inspect the saved error. |

`accepted` is provider acceptance, not confirmation of inbox delivery. Use the stored provider ID to check delivery or bounce details in Resend.

## Project Structure

```text
src/
  main.jsx                       Dashboard and live database integration
  components.jsx                 Connection, login, insert, and detail dialogs
  lib.js                         Supabase configuration and helpers
  style.css                      Application styles
supabase/
  config.toml                    Edge Function configuration
  setup.sql                      Vault settings and operator role setup
  migrations/
    202609060001_contacts.sql     Contacts table
    202609060002_live_email.sql   Access policies, status tracking, and triggers
  functions/send-insert-email/
    index.ts                     Deno entry point
    handler.js                   Authentication, email sending, and result storage
scripts/                         Handler, database, and helper tests
browser-tests/                   Browser workflow tests
.env.example                     Environment variable template
```

## Security and Retry Behavior

Database policies restrict contact access to operators. The function validates the webhook secret, reads the authoritative contact from the database, and atomically claims the job before sending. A frozen email payload and per-record idempotency key help prevent duplicate sends.

Failed or stuck jobs can be retried after one minute, within 23 hours of their first attempt. Accepted jobs cannot be retried. If the retry window has expired, check provider history before deciding whether to send another email.

Database HTTP dispatch is asynchronous and does not provide a durable retry queue. A failed endpoint call can leave a record queued; correct the configuration and use the retry control. Missing Vault configuration causes the insert to fail with a setup error.

## Commands and Automated Tests

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create the production frontend build. |
| `npm run preview` | Preview the production build locally. |
| `npm test` | Run handler, database, and helper tests. |
| `npm run test:browser` | Run browser workflow tests. |

Browser tests use installed Microsoft Edge by default. To use Chrome in PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:browser
```

Automated tests mock external email and Supabase HTTP calls. Database tests execute the SQL logic in PGlite with Vault and HTTP dispatch interfaces stubbed. They do not send real emails or verify a hosted deployment. Complete the manual test above after configuring your own credentials.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| Connection rejected | Use the base project URL and its matching public key. |
| Operator access required | Assign the operator role with `setup.sql`, then sign out and back in. |
| Missing table, column, or function | Apply both migrations to the connected project. |
| Automation not configured | Add both required Vault entries. |
| Record remains queued | Check the function URL, matching webhook secrets, Edge Function logs, and `net._http_response`. |
| Email provider rejection | Check the Resend API key, verified sender, account limits, and saved error. |
| Accepted email is not in the inbox | Check Resend delivery details, bounces, and the recipient's spam folder. |
