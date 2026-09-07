# Task 60: Supabase User Administration

A read-only user directory built with React, Vite, and Express. Administrators sign in through Supabase Auth and view project users retrieved by the server using `supabase.auth.admin.listUsers()`.

## Features

- Email/password sign-in and sign-out.
- Server-side administrator access control using an allowlist of Supabase user UUIDs.
- Directory showing email or phone, user ID, email verification status, creation date, and last sign-in date.
- Search by email, phone, or user ID, plus manual refresh.
- Total user and verified-email counts.
- Paginated retrieval of all Auth users, with loading, empty, and error states.

The application supports viewing users only; it does not create, edit, or delete accounts.

## Technology

React 19, Vite 7, Express 5, Supabase JavaScript client, and the Node.js built-in test runner.

## Setup

1. Install Node.js 20.19+ or 22.12+ and npm.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Create or update `.env` in the project root with the following variables. Replace the placeholders with your Supabase configuration and preserve any existing valid values.

   ```dotenv
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-server-service-role-key
   ADMIN_USER_IDS=your-admin-user-uuid
   PORT=3001

   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
   ```

   Use the same Supabase project for both URLs. Keep the service role key on the server: never put it in a `VITE_` variable or frontend code. Variables prefixed with `VITE_` are included in the browser build.

4. Create an email/password account in your Supabase Authentication dashboard, or use an existing account. Add its user UUID to `ADMIN_USER_IDS`. Separate multiple administrator UUIDs with commas. An empty allowlist denies access to everyone.
5. Start development:

   ```sh
   npm run dev
   ```

6. Open the Vite URL printed in the terminal, usually `http://localhost:5173`. Sign in with the allowlisted account's email and password, replacing any prefilled form values with your own account details.

The development command starts both Vite and Express. Vite forwards `/api` requests to `http://localhost:3001`, removing the `/api` prefix. If you change `PORT`, update the proxy target in `vite.config.js` to match. Restart development after changing environment variables.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the frontend and backend with development watchers. |
| `npm run build` | Build the frontend into `dist/`. |
| `npm start` | Start Express and serve the built frontend and API. |
| `npm test` | Run API tests with mocked Supabase responses. |

To run the production build locally:

```sh
npm run build
npm start
```

Open `http://localhost:3001`, or the configured port. Set frontend `VITE_` variables before building; changes to them require rebuilding.

## API

```http
GET /admin/users
Authorization: Bearer <Supabase-user-access-token>
```

`GET /api/admin/users` is also supported and is the route used by React.

The server validates the token with Supabase, checks the user's UUID against `ADMIN_USER_IDS`, and retrieves users in pages of 1,000 until a partial or empty page is returned. Responses include only directory fields and set `Cache-Control: no-store`.

Example successful response:

```json
{
  "users": [
    {
      "id": "example-user-uuid",
      "email": "user@example.com",
      "phone": "",
      "created_at": "2026-01-01T10:00:00Z",
      "last_sign_in_at": null,
      "email_confirmed_at": null
    }
  ],
  "total": 1
}
```

Error responses use the shape `{ "error": "message" }`.

| Status | Meaning |
| --- | --- |
| `200` | Users retrieved successfully. |
| `401` | Missing, invalid, or expired access token. |
| `403` | Authenticated user is not in the administrator allowlist. |
| `502` | Supabase retrieval failed or an exception occurred during the request. |
| `503` | Server Supabase configuration is missing. |

## Project Structure

```text
server/
  app.js        API routes, authorization, and user retrieval
  app.test.js   API tests using mocked Supabase clients
  index.js      Environment configuration and Express startup
src/
  main.jsx      Sign-in form and user directory interface
  style.css     Application styles
index.html      Frontend entry page
vite.config.js  Development API proxy configuration
package.json    Dependencies and scripts
```

## Testing

Run `npm test` to check authentication, administrator access, pagination, private metadata filtering, cache headers, and configuration/upstream errors. Tests use mocked Supabase clients and require no live project. Signing in and viewing real users requires valid Supabase configuration.
