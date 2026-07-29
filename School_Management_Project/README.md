# School Management

A production-oriented assignment and attendance platform for educational institutes. Built with React, Vite, TypeScript, Tailwind CSS, Supabase, TanStack Query/Table, React Hook Form, Zod, Zustand, and shadcn-style accessible components.

## Included workflows

- Supabase login, signup, forgot password, reset password, and session refresh
- Super Admin, Admin, Teacher, and Student route authorization
- Role-specific dashboards using live Supabase data
- User activation and role management
- Course and batch create/edit/delete management
- Administrator-created student and teacher Auth accounts
- Student academic profiles, contact editing, and profile-picture uploads
- Assignment draft/publish/close, editing, deletion, PDF/image attachments, and signed downloads
- Student assignment submission, remarks, replacement submissions, late indicators, marks, feedback, and staff review
- Attendance marking with Present, Absent, Late, and Leave
- Saved attendance reload, historical reports, filters, summaries, and CSV exports
- In-app notifications, read state, automatic assignment/submission notifications, and preferences
- Responsive sidebar, search, pagination, dark mode, loading skeletons, empty states, error states, and toast feedback
- Configurable institute name and logo (Settings â†’ Institute, Admin/Super Admin only), applied live to the login screen, sidebar, and browser tab title
- Normalized PostgreSQL schema, foreign keys, RLS policies, private Storage buckets, triggers, and activity logs
- Vercel SPA deployment and future Tauri/Electron-compatible feature separation

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project
- Supabase CLI when deploying migrations and Edge Functions from the terminal

## Local installation

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set your real project values in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_APP_URL=http://localhost:5173
```

`.env.example` is only a template. Vite reads `.env`. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `VITE_` variable.

## Supabase setup

### Option A: Supabase Dashboard SQL Editor

1. Open **Supabase Dashboard â†’ SQL Editor**.
2. Open `supabase/complete_project_setup.sql` from this repository.
3. Copy the entire file into the SQL Editor and click **Run**.
4. The script creates or repairs the schema, existing Auth profiles, default roles, RLS, Storage policies, preferences, automatic notifications, and activity logging.
5. Additionally run the numbered migrations after the base setup, including
   `005_institute_settings.sql`, `006_submission_authorization.sql`, and
   `007_fix_student_submission_authorization.sql` (or run `npx supabase db push`
   with the CLI). These additive migrations enable institute branding and ensure
   linked student accounts can submit work to published assignments for their batch.
### Option B: Supabase CLI

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy create-user
```

The `create-user` Edge Function uses the server-only service-role key supplied by Supabase. It creates complete Student and Teacher accounts without exposing privileged credentials to the browser.

## First Super Admin

The institute's admin account is **fatima@gmail.com**.

1. Have Fatima create an account through Signup using `fatima@gmail.com`.
2. Open `supabase/bootstrap_fatima_admin.sql` in the Supabase Dashboard SQL Editor and run it. It promotes her from the default Student role to Super Admin.
3. Sign out and sign in again â€” the Super Admin dashboard, Users & roles, Reports, and Settings â†’ Institute sections will now be available.

`supabase/bootstrap_first_admin.sql` is the generic template this was adapted from, in case you need to bootstrap a different admin email later.

Every other account (Admin, Teacher, Student) is created **from inside the app** by Fatima (or another Super Admin/Admin) â€” there is no separate SQL step for them:

- **Teacher and Student accounts**: Fatima creates these from the Teachers / Students management pages, which call the `create-user` Edge Function. She sets their role, course, batch, and profile fields at creation time.
- **Promoting/demoting Admins or Teachers**: use **Users & roles** (`/users`), which only Super Admin/Admin can see.

## Authentication URL configuration

In **Supabase ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Authentication ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ URL Configuration**, add:

- Site URL: your local or production URL
- Local reset redirect: `http://localhost:5173/reset-password`
- Production reset redirect: `https://YOUR_DOMAIN/reset-password`

If email confirmation is enabled, users must confirm their email before signing in.

## Storage

Setup creates:

- `avatars`: public profile images, owner-managed
- `assignment-files`: private staff-managed attachments
- `submission-files`: private student submissions

Accepted assignment/submission types are PDF, JPEG, PNG, and WebP, with a 15 MB limit. Files are opened through short-lived signed URLs.

## Row Level Security

Authorization is enforced in PostgreSQL:

- Students see their own student, submission, attendance, and notification records.
- Teachers can manage assignments they own and mark attendance.
- Admins manage institute records.
- Super Admins can also manage roles.

React route guards improve navigation but are not the security boundary; Supabase RLS is.

## Verification

```powershell
npm run lint
npm run build
npm run preview
```

## Vercel deployment

1. Import the repository into Vercel.
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy.

`vercel.json` rewrites client-side routes to `index.html`.

## Project architecture

Browser-specific Supabase and Storage operations are isolated in feature API and service modules. UI, state, validation, and routing remain separate, allowing a future Tauri or Electron shell to replace platform adapters without rewriting business pages.

