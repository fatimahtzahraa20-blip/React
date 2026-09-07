# SaaS Board

SaaS Board is a polished React + TypeScript capstone workspace for collaborative SaaS task management. It runs without secrets and includes a responsive task dashboard, project navigation, filtering, task creation, completion, attachment selection, live activity updates, and notifications.

## Run locally

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
npm run lint
```

## Backend handoff: Supabase

The UI is ready to connect to Supabase when environment values are available. Recommended tables:

- `profiles`: one row per `auth.users` record.
- `workspaces`: organization-level tenant records.
- `workspace_members`: membership and role (`owner`, `admin`, `member`).
- `projects`: workspace-owned projects.
- `tasks`: project-owned work items with status, priority, due date, and assignee.
- `attachments`: task-owned Storage object metadata (`bucket`, `path`, `filename`, `mime_type`, `size`).
- `activity_events`: append-only workspace activity used by the live activity rail.

### RLS policy baseline

Enable Row Level Security on every table. Every read and write should be scoped through `workspace_members` using the authenticated user id (`auth.uid()`). A task policy should verify that its project belongs to a workspace where the user is an active member. Attachment rows should use the same task membership check, while Storage object paths should follow `workspace_id/task_id/file_id` and use a matching Storage policy. Only owners and admins should update membership or delete workspace data.

### Realtime channels

Subscribe to `tasks`, `attachments`, and `activity_events` changes filtered by `workspace_id`. Insert an `activity_events` row from a trusted server-side function after task, attachment, or membership changes. The current local state mirrors that contract so the interaction can be demonstrated before connecting credentials.

### Environment values

When wiring the backend, add a local `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then create a small client module that reads those values. Never expose a service role key in the browser.

## Product notes

SaaS Board uses a focused workspace layout: persistent navigation, summary metrics, task table, activity stream, and attachment affordances. The responsive breakpoint collapses navigation and task metadata for smaller screens while preserving the primary workflow.
