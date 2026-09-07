# Task 65: Environment Variables in React

## Objective

Store the Supabase URL and API key in a root-level `.env` file instead of hardcoding them in React source files. This project uses React, Vite, and the Supabase JavaScript client.

## Implementation

- `src/lib/supabase.js` reads the configuration through `import.meta.env` and initializes the Supabase client.
- `.gitignore` excludes `.env` and environment-specific files from version control.
- The app displays setup instructions when configuration is missing or client initialization fails.
- A **Check connection** button verifies that the Supabase Auth endpoint responds.

Vite requires the `VITE_` prefix for variables used by browser code:

| Setting | Environment variable |
| --- | --- |
| Supabase project URL | `VITE_SUPABASE_URL` |
| Supabase publishable key | `VITE_SUPABASE_PUBLISHABLE_KEY` |

## Local setup

1. Install the dependencies:

   ```sh
   npm install
   ```

2. Create or edit `.env` in the project root, beside `package.json`. Replace the placeholders with the URL and publishable key from your Supabase project:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. Start the React app:

   ```sh
   npm run dev
   ```

4. Open the local URL printed in the terminal.

Restart the development server after changing `.env`.

## Verify the connection

Click **Check connection** in the app.

- **Configured** means the Supabase client was initialized; no connection has been verified yet.
- **Connection verified** means the Supabase Auth settings endpoint responded successfully.
- **Check failed** displays an error for rejected credentials, an unreachable project, an unexpected response, or a timeout.

The check sends a read-only request and times out after 10 seconds. It does not create records, sign in a user, or verify database permissions.

If the check fails, confirm that the URL and key belong to the same project, check that the project is active, and restart Vite after correcting the configuration.

## Using the client

Import the shared client where database or authentication operations are needed:

```js
import { supabase } from './lib/supabase'
```

The export is `null` when configuration is missing or initialization fails. Check that it is available before calling Supabase methods.

## Environment variable security

The `.env` file keeps configuration out of source code and is ignored by Git. However, Vite includes `VITE_` values in the browser bundle, so they are visible to users.

Use a Supabase publishable key or a legacy anon key in this React app. Never put a Supabase secret or `service_role` key in frontend environment variables. Keep server secrets in a backend environment and protect database access with Row Level Security policies.

For deployment, set the same environment variables in your hosting provider before building the app.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## References

- [Supabase React quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)

