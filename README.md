# Academic Command

Deploy this app with the step-by-step [Vercel deployment guide](DEPLOYMENT.md). Vercel configuration is included.

React + Supabase workspace for academic allocations, workload and thesis supervision.

## Run

```powershell
npm install
npm run dev
```

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. Never put a service-role key in frontend variables. Without configuration the app uses a clearly marked local demo. Configured workspaces require a successful Supabase sign-in and a database profile; there is no fallback administrator login.

## Supabase setup

For an **existing database** that already has the foundation tables, run only [dashboard_access.sql](supabase/dashboard_access.sql) in SQL Editor. This migration replaces application RLS policies and RPCs, preserving records. It requires the tables from both foundation files below.

For a **new database**, run these files in order:

1. [schema.sql](supabase/schema.sql)
2. [production_schema.sql](supabase/production_schema.sql)
3. [roles.sql](supabase/roles.sql)
4. [dashboard_access.sql](supabase/dashboard_access.sql)

Always apply dashboard_access.sql last. Do not rerun the original foundation schemas against an existing database. Do not use default_admin.sql for deployment.

Create the initial trusted administrator in Supabase Authentication, then set their `profiles.role` to `admin` in SQL Editor. Link each faculty record's `profile_id` to that person's Auth UUID. Unlinked faculty accounts correctly show empty personal dashboards. The migration includes commented SQL templates for both operations.

The current roles apply to one academic workspace: Admin manages users and academic work; HOD manages sessions, approvals and allocations; Coordinator manages allocations and reporting; Faculty can read their own allocated courses, workload and supervised theses. Programme-specific coordinator scopes are not implemented. All roles can change appearance and their sign-in password. Role edits cannot change the currently signed-in administrator's own role.

## Invitations

Deploy the included authenticated admin-only Edge Function:

```powershell
supabase functions deploy invite-user
```

Configure Supabase Auth Site URL and allowed redirect URLs to the running application. Invitations use the server-side Admin API. All signup profiles initially receive Faculty access; the admin-only function then assigns the requested role using server credentials. The invitee follows the email link and sets a password in Settings. Failed role updates and invitations are reported rather than displayed as successful local changes.

## Import and export

CSV import assigns **existing** offerings to existing faculty. Required columns:

```csv
offering_id,faculty_id
11111111-1111-4111-8111-111111111111,22222222-2222-4222-8222-222222222222
```

Use real IDs from the allocation and faculty downloads. Additional descriptive columns are accepted. Up to 500 rows / 1 MB per file. Import replaces existing assignments; the database rolls back the entire import if any row fails. Approved sessions reject allocation changes. Course creation is managed in the database; importing a CSV does not create courses or faculty.

Allocation history and activity show actual database records, up to 100 newest entries. New allocation inserts/updates and session approvals generate audit entries. Workload overages are shown against each faculty member's credit limit; they are advisory, not an automatic scheduling engine.

## Validation

```powershell
npm run build
node --test tests/access.test.js
```

Tests cover role access, nested course relationships and CSV validation/export. Apply and test the migration in your Supabase environment before using operational accounts. This workspace does not include a local Postgres or Deno runtime for executing SQL or Edge Function integration tests.

## Role sign-in shortcuts

The sign-in screen offers Admin, HOD, Coordinator and Lecturer. In local development, Admin credentials are prefilled on page load. Clicking any role fills its demo credentials and immediately attempts Supabase authentication. Manual email/password entry is also available. The authenticated database profile, not the chosen card, determines dashboard access. Lecturer maps to the existing `faculty` database role.

Create matching demo accounts in Supabase Authentication > Users using the defaults in `.env.example`, then run `supabase/demo_account_roles.sql` to assign their roles. This SQL only updates existing accounts; it does not create passwords. If using different demo emails, update both your environment overrides and the SQL email mapping. Faculty account linking still applies.

The `VITE_DEMO_*` overrides contain public demonstration credentials and are included in browser code. Do not use real staff passwords. Production autofill is off by default; explicitly set `VITE_ENABLE_DEMO_LOGIN=true` only for a public demo deployment. Restart Vite after changing environment values.

## Working academic record entry

Run `supabase/academic_workflows.sql` **after** `supabase/dashboard_access.sql` to enable the record forms. Existing data is preserved. Reapply academic_workflows.sql whenever dashboard_access.sql is rerun, because the latter resets table policies.

1. Admin/HOD: open Semester planning, add a programme and create a session.
2. Admin/HOD: open Faculty directory and add faculty. Enter an existing account email to link personal dashboard access, or leave it empty for a faculty member without login access.
3. Admin/HOD/Coordinator: open Course allocation, add course offerings to an unapproved session, then assign faculty.
4. Open Thesis supervision to register students and theses. Managers and the assigned supervisor can update research progress.
5. Report and resolve issues in Conflict centre; inspect saved changes in Activity log and download reports.

Administrators with an empty course/faculty dataset also see **Load example records** on Overview. This explicitly saves a DEMO-CS programme, DM26 session, six courses (four allocated), two faculty and two theses. It is transactional and refuses to repeat or overwrite a matching example programme/session. Example faculty are not linked to real login accounts automatically.

The migration also makes offering uniqueness session-specific, so a course can be offered again in a later session. Record creation runs as a validated RPC with role checks. Partial read failures are shown in a notification while other sections remain available. SQL integration and live browser testing still require the configured Supabase environment.


### Course entry and student directory update

Reapply the complete `supabase/academic_workflows.sql` after this update. Course entry now selects a saved programme and offers existing catalogue courses with their exact title/credits. Errors stay beside the form. The migration discovers legacy offering uniqueness constraints by their columns rather than assuming one constraint name.

The Students page lists and searches students, with an Add student form for managers. Load example records on Overview adds eight undergraduate students alongside the two thesis students and two lecturers. Running the loader again adds missing undergraduate examples without duplicating them. No remote SQL or sample data is applied automatically by the code update.

## HOD, Coordinator and Lecturer CRUD

Apply `supabase/role_crud.sql` **last**, after dashboard_access.sql and academic_workflows.sql. This adds the validated edit/delete RPC and a private teaching_notes table. SQL was prepared locally; remote integration must be verified after applying it.

| Role | Create, view, edit and delete | Additional access |
| --- | --- | --- |
| HOD | Programmes, sessions, lecturers, students, course offerings, theses, conflicts | Allocate courses and approve sessions |
| Coordinator | Students, course offerings, theses, conflicts | View lecturers; allocate courses; no session approval or user-role management |
| Lecturer | Own private teaching notes, in My courses | Read own assigned courses/workload and update own supervised thesis progress |

Edit controls intentionally expose selected fields: offering semester/section; lecturer name/credit limit; student number/name; thesis title/deadline; programme code/name; session title; conflict type/description. Existing allocation controls handle faculty reassignment. Shared course catalogue title/credits are not changed by offering edits.

Delete actions require an inline confirmation. Records with dependent academic data are rejected, and approved sessions/offerings remain locked. Management edits/deletes are recorded in Activity log. Lecturers cannot create/delete institutional course, faculty or student records. Teaching notes use database ownership policies on every operation.


### Faculty academic CRUD update

Run `supabase/faculty_crud.sql` on an already migrated database. Faculty can create a thesis under their own linked supervisor record, read their supervised theses, edit the title/deadline and progress, and delete their own supervised theses with confirmation. The database checks supervisor ownership on create, update and delete; the selected UI role alone never grants access. Existing student records are retained when deleting a thesis. Faculty still cannot edit institutional course offerings or other lecturers' records. Private teaching-note CRUD remains available.


## Populated role dashboards

Run `supabase/populate_dashboards.sql` last to install batches and add a fictional development dataset: 3 batches, 36 students, 4 instructors, 12 offerings (9 allocated) and 3 theses. Names and titles appear normally in the UI; this dataset is fictional and is not a record of real students or staff. Stable IDs prevent duplicate insertion on reruns; existing records are not replaced. Conflicting reserved codes cause the transaction to fail rather than overwrite data.

An existing administrator profile is required for allocation auditing. If `lecturer@example.test` exists with the faculty role, its linked instructor is reused or a new instructor is linked to it. That account sees its assigned batches, their students and supervised theses. Other faculty accounts only see their own authorized records. No Auth accounts or passwords are created. If the lecturer account is created later, rerun the script to establish its link.

All four dashboards now show batches and a student roster (up to 12 records), calculated through RLS. Apply populate_dashboards.sql again after dashboard_access.sql if rebuilding policies. The remote migration/data load is not performed by the frontend update.


### Empty HOD / Coordinator / Lecturer dashboards

Run `supabase/repair_role_dashboards.sql` after populate_dashboards.sql, then sign out and back in. It verifies the three shortcut Auth accounts exist, creates missing profiles, assigns their intended roles, and links the Lecturer to an instructor. When a previously linked instructor differs from the seeded instructor, only the identified fictional assignments are transferred. Existing unrelated assignments are preserved. One unallocated postgraduate offering is assigned to the lecturer so all three batches are represented.

HOD and Coordinator use department-wide read policies and need no instructor link. Lecturer data stays limited to assigned courses, their batches/students and supervised theses. The SQL ends with account/link counts to help verify setup. If shortcut emails were customized, edit the mapping before running. This script is prepared locally and has not been applied remotely.
