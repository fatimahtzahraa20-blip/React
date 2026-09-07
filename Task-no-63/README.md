# Capstone

Capstone is a professional kanban workspace for the Task 73 database design capstone. It is built with React, TypeScript, Vite, and Supabase-ready data contracts.

## Run locally

```bash
npm install
npm run dev
```

The app works immediately in local-preview mode. Tasks and lists persist in browser storage, so the side navigation, search, filters, list menus, task creation, and settings remain usable without credentials.

## Connect Supabase

1. Copy `.env.example` to `.env.local`.
2. Add your values from Supabase Project Settings > API:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

3. Run the migration in `supabase/migrations/20260908000000_taskflow_schema.sql` with the Supabase CLI or SQL Editor.
4. Restart the Vite dev server.

The Supabase client is in `src/lib/supabase.ts`. Secrets are excluded by `.gitignore`; only `.env.example` is committed.

## Included database design

- `profiles`: authenticated users and display details
- `boards`: owned workspaces
- `board_members`: board membership and editor roles
- `lists`: ordered kanban columns
- `tasks`: assignable work items with priority, due date, position, and completion state
- Indexes, update timestamps, enum validation, and row-level security policies

## Verification

```bash
npm run build
npm run lint
```
