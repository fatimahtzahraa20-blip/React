# Task 64: JWT Middleware

## Objective

Write an Express `authMiddleware` that verifies a JWT from the `Authorization` header. This project includes a React playground for generating demo tokens, sending authenticated requests, and inspecting the server response.

JWT verification runs in Express. React sends the token and displays the result; the signing secret stays on the server.

## Technology

- React and Vite for the interface.
- Express for the API and protected routes.
- `jsonwebtoken` for JWT signing and verification.
- Node.js test runner for middleware and API tests.
- Playwright with Microsoft Edge for browser checks.

## Setup

Use Node.js 22.12 or newer and npm. Run these commands from the project directory:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. This command starts both Vite and Express. The API listens at http://127.0.0.1:3001, and Vite forwards `/api` requests to it.

## Test the main flow

1. Wait for **API connected**.
2. Select `/api/protected`.
3. Click **Generate token**. Expand **Demo token settings** first if you want to change the name, role, or lifetime.
4. Click **Send request**.
5. Inspect the `200` response and verified user payload.

You can also paste a JWT or `Bearer <token>` into the token field. The interface sends exactly one Bearer prefix.

To test rejection, choose **Expired**, **Bad signature**, **Not active**, or **Wrong audience**, then click **Send request**. Use **No token** followed by **Send request** to test a missing header. These requests return `401`.

For `/api/admin`, a developer token returns `403`. Change the demo role to **Admin**, generate a new token, and send it to receive `200`.

For `/api/echo`, enter valid JSON in the request body and send a valid token. The API returns the submitted data and verified identity.

## Middleware behavior

The middleware is implemented in `server/authMiddleware.js` as a factory that returns the Express `authMiddleware` function.

1. Extract the token from `Authorization: Bearer <token>`.
2. Verify the signature using the server secret and the allowed `HS256` algorithm.
3. Validate expiration, activation time when present, issuer `task-64`, and audience `task-64-api`.
4. Require a subject (`sub`) and numeric expiration (`exp`).
5. Attach the verified payload to `req.user` and call `next()`.
6. Return a JSON error with status `401` if authentication fails.

Example route registration from a server module:

```js
import { createAuthMiddleware } from './authMiddleware.js';

const authMiddleware = createAuthMiddleware(process.env.JWT_SECRET);

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

Example React request using an existing token:

```js
const response = await fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` },
});
const result = await response.json();
```

## API endpoints

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Reports API status and demo-token availability. |
| POST | `/api/demo-token` | Generates a test token outside production mode. |
| GET | `/api/protected` | Returns the verified user for a valid token. |
| GET | `/api/admin` | Requires a valid token with the `admin` role. |
| POST | `/api/echo` | Returns JSON input and the verified user. |

The demo-token endpoint accepts the following JSON fields:

```json
{
  "name": "Alex Morgan",
  "role": "developer",
  "expiresIn": 3600,
  "scenario": "valid"
}
```

Roles are `developer` or `admin`. Lifetime is an integer from 1 to 86400 seconds. Scenarios are `valid`, `expired`, `future`, `signature`, and `audience`.

## Playground features

- Decode token headers and claims with a live expiration countdown. Decoding alone does not verify a token.
- Inspect request details, response headers, HTTP status, and duration.
- Restore up to 20 requests from in-memory session history.
- Copy tokens or results and export response JSON with the Authorization header redacted.
- Display network errors, timeouts, and non-JSON responses, then allow retry.

Refreshing the page clears tokens and history.

## Configuration

Without `JWT_SECRET`, development uses a random secret generated at server startup. Restarting the API invalidates previously generated tokens.

To keep the secret stable during local development, set it in the server environment before starting the app. For example, in PowerShell:

```powershell
$env:JWT_SECRET = 'replace-with-a-long-random-secret'
npm run dev
```

The app does not automatically load `.env` files. Never place the secret in React code or a `VITE_` variable.

When `NODE_ENV=production`, `JWT_SECRET` is required and the demo-token endpoint is disabled. Production token issuance requires your own login flow; this project provides a test identity, not account registration or login.

## Commands and validation

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the React development server and Express API. |
| `npm test` | Run middleware and HTTP integration tests. |
| `npm run test:browser` | Run browser checks against an already running app. |
| `npm run build` | Build React into `dist`. |
| `npm start` | Start Express and serve the existing `dist` build. |

Browser checks require Microsoft Edge installed on the machine. They default to http://127.0.0.1:5173; set `APP_URL` to use a different running URL. Checks cover Bearer headers, token generation, missing and expired tokens, role authorization, JSON requests, server errors, and retries.

To serve the built app locally:

```sh
npm run build
npm start
```

Open http://127.0.0.1:3001. Building the frontend does not automatically enable production mode.

## Project structure

```text
server/
  authMiddleware.js       JWT authentication middleware
  authMiddleware.test.js  Middleware tests
  app.js                  Express routes and demo token generation
  app.test.js             HTTP integration tests
  index.js                Server entry point
src/
  main.jsx                React playground
  api.js                  Request handling and timeouts
  style.css               Responsive styles
browser-check.mjs         Browser regression checks
vite.config.js            Frontend configuration and API proxy
```

## Troubleshooting

- **API offline:** Run `npm run dev` from the project folder and check the terminal for startup errors. Both frontend and API must be running.
- **Invalid token after restarting:** Generate a new token, or configure a persistent server secret.
- **401 response:** Check the token's signature, expiration, subject, issuer, and audience. A token signed by another service or secret is not accepted by this configuration.
- **403 on the admin route:** Generate a new token with the admin role.
- **Non-JSON response:** Check that `/api` requests reach Express rather than a static frontend server.
