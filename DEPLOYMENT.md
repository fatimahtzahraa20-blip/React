# Deploy to Vercel

## 1. Import this project

Push the project to a GitHub repository, including `package-lock.json` and `vercel.json`. Local `.env`, `node_modules` and build output are excluded by `.gitignore`.

In Vercel, choose **Add New → Project**, import that repository, and use the folder containing `package.json` as the root directory. The committed configuration selects Vite, runs `npm ci` and `npm run build`, and serves `dist`. It also handles direct SPA links.

## 2. Add environment variables before deploying

Copy these values from your Supabase project settings into Vercel's project Environment Variables:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key |
| `VITE_ENABLE_DEMO_LOGIN` | `false` for normal account sign-in |

Select Production and, if needed, Preview environments. Do not upload your `.env` file. These VITE values are public browser configuration; never add a service-role key here.

For a public academic demonstration with the existing one-click role shortcuts, explicitly set `VITE_ENABLE_DEMO_LOGIN=true`. Optional `VITE_DEMO_*` overrides are listed in `.env.example`. Those credentials become public and must belong only to demonstration accounts. With this option off, users enter their own credentials.

Click **Deploy**. Changes to environment variables require a new deployment because Vite embeds them at build time.

## 3. Connect Supabase Auth to the deployed URL

In Supabase **Authentication → URL Configuration**, set Site URL to your actual Vercel URL, such as `https://your-project.vercel.app`. Add that URL to Redirect URLs as well. Keep your local development URL if still needed. If using a custom domain, add it too. Use the production URL when testing invitation emails.

The database remains in Supabase; Vercel does not execute SQL migrations. If you already ran the project migrations, keep the existing database. For a new project, follow the SQL installation instructions in README.md. Do not rerun the foundation schema on an existing database.

If using Team Management invitations, deploy the Supabase function separately:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy invite-user
```

The function uses Supabase's server environment for its service-role credentials; they are never needed in Vercel.

## 4. Verify

Open the deployed URL and sign in with each existing role account. Check dashboards, saving a record, CSV downloads and sign-out. For invitations, follow the email link and set a password in Settings.

If the build reports missing Supabase configuration, add the two required variables and redeploy. If login fails, check that the Auth account/password exists in the same Supabase project used by Vercel. If data is empty, check database roles, migrations and lecturer links as described in README.md.

Reference: [Vercel's official Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite).
