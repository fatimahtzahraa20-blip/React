-- Northstar School Management - Existing Profiles Compatible Setup
-- Safe for the existing public.profiles table; preserves current profile records.
-- Creates schema, triggers, authorization helpers, RLS, storage policies and starter catalog data.

-- Northstar School Management - normalized PostgreSQL schema
create extension if not exists "pgcrypto";

do $$ begin create type public.app_role as enum ('super_admin', 'admin', 'teacher', 'student'); exception when duplicate_object then null; end $$;
do $$ begin create type public.assignment_status as enum ('draft', 'published', 'closed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.submission_status as enum ('submitted', 'reviewed', 'returned'); exception when duplicate_object then null; end $$;
do $$ begin create type public.attendance_status as enum ('present', 'absent', 'late', 'leave'); exception when duplicate_object then null; end $$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.app_role not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists is_active boolean not null default true;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

update public.profiles p
set full_name = coalesce(nullif(p.full_name, ''), u.raw_user_meta_data ->> 'full_name', split_part(coalesce(u.email, ''), '@', 1), 'Unnamed User'),
    email = coalesce(nullif(p.email, ''), u.email, p.id::text || '@local.invalid')
from auth.users u
where u.id = p.id and (p.full_name is null or p.full_name = '' or p.email is null or p.email = '');

update public.profiles set full_name = 'Unnamed User' where full_name is null or full_name = '';
update public.profiles set email = id::text || '@local.invalid' where email is null or email = '';
alter table public.profiles alter column full_name set not null;
alter table public.profiles alter column email set not null;

create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, role_id)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  duration_months integer check (duration_months > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  name text not null,
  timing text not null,
  start_date date not null,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_id, name)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  application_id text not null unique,
  father_name text not null,
  address text,
  course_id uuid not null references public.courses(id) on delete restrict,
  batch_id uuid not null references public.batches(id) on delete restrict,
  enrollment_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  employee_id text not null unique,
  specialization text,
  joining_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_batches (
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, batch_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  course_id uuid not null references public.courses(id) on delete restrict,
  batch_id uuid not null references public.batches(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  due_at timestamptz not null,
  status public.assignment_status not null default 'draft',
  max_marks numeric(6,2) check (max_marks >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_files (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  remarks text,
  status public.submission_status not null default 'submitted',
  marks numeric(6,2) check (marks >= 0),
  feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(assignment_id, student_id)
);

create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.assignment_submissions(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  attendance_date date not null,
  status public.attendance_status not null,
  marked_by uuid not null references public.profiles(id) on delete restrict,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, attendance_date)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Compatibility repair for an existing legacy public.notifications table.
-- Existing rows and legacy columns are preserved.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid()
);

alter table public.notifications
  add column if not exists recipient_id uuid;
alter table public.notifications
  add column if not exists title text;
alter table public.notifications
  add column if not exists message text;
alter table public.notifications
  add column if not exists link text;
alter table public.notifications
  add column if not exists read_at timestamptz;
alter table public.notifications
  add column if not exists created_at timestamptz not null default now();

-- Copy a legacy user_id column when it exists and is UUID-compatible.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notifications'
      and column_name = 'user_id'
      and data_type = 'uuid'
  ) then
    execute '
      update public.notifications
      set recipient_id = user_id
      where recipient_id is null
    ';
  end if;
end;
$$;

-- Convert a legacy is_read flag to a timestamp without removing the old field.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notifications'
      and column_name = 'is_read'
      and data_type = 'boolean'
  ) then
    execute '
      update public.notifications
      set read_at = coalesce(read_at, created_at, now())
      where is_read = true and read_at is null
    ';
  end if;
end;
$$;

update public.notifications
set title = 'Notification'
where title is null or btrim(title) = '';

update public.notifications
set message = 'No additional details'
where message is null or btrim(message) = '';

alter table public.notifications alter column title set not null;
alter table public.notifications alter column message set not null;

-- Add the profile foreign key only once.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_recipient_id_fkey'
      and conrelid = 'public.notifications'::regclass
  ) then
    alter table public.notifications
      add constraint notifications_recipient_id_fkey
      foreign key (recipient_id)
      references public.profiles(id)
      on delete cascade
      not valid;
  end if;
end;
$$;

create index if not exists notifications_recipient_idx
  on public.notifications(recipient_id, created_at desc);


create index if not exists students_course_idx on public.students(course_id);
create index if not exists students_batch_idx on public.students(batch_id);
create index if not exists assignments_batch_due_idx on public.assignments(batch_id, due_at);
create index if not exists submissions_assignment_idx on public.assignment_submissions(assignment_id);
create index if not exists attendance_batch_date_idx on public.attendance(batch_id, attendance_date);
create index if not exists notifications_recipient_idx on public.notifications(recipient_id, created_at desc);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);

insert into public.roles(name, description) values
  ('super_admin', 'Full platform access'),
  ('admin', 'Institute administration access'),
  ('teacher', 'Teaching and class management access'),
  ('student', 'Student self-service access')
on conflict (name) do nothing;

-- Backfill Auth users created before the profile trigger existed.
insert into public.profiles (id, full_name, email)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), nullif(split_part(coalesce(u.email, ''), '@', 1), ''), 'Northstar User'),
  coalesce(u.email, u.id::text || '@local.invalid')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

insert into public.profile_roles (profile_id, role_id)
select p.id, r.id
from public.profiles p
cross join public.roles r
where r.name = 'student'
  and not exists (select 1 from public.profile_roles pr where pr.profile_id = p.id)
on conflict do nothing;

-- Preserve and normalize roles from the legacy profiles.role column when it exists.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) then
    execute $migration$
      insert into public.profile_roles(profile_id, role_id)
      select p.id, r.id
      from public.profiles p
      join public.roles r on r.name = case
        when lower(p.role) in ('super_admin', 'super admin') then 'super_admin'::public.app_role
        when lower(p.role) = 'admin' then 'admin'::public.app_role
        when lower(p.role) = 'teacher' then 'teacher'::public.app_role
        else 'student'::public.app_role
      end
      on conflict do nothing
    $migration$;
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists courses_updated on public.courses;
create trigger courses_updated before update on public.courses for each row execute function public.set_updated_at();
drop trigger if exists batches_updated on public.batches;
create trigger batches_updated before update on public.batches for each row execute function public.set_updated_at();
drop trigger if exists students_updated on public.students;
create trigger students_updated before update on public.students for each row execute function public.set_updated_at();
drop trigger if exists teachers_updated on public.teachers;
create trigger teachers_updated before update on public.teachers for each row execute function public.set_updated_at();
drop trigger if exists assignments_updated on public.assignments;
create trigger assignments_updated before update on public.assignments for each row execute function public.set_updated_at();
drop trigger if exists submissions_updated on public.assignment_submissions;
create trigger submissions_updated before update on public.assignment_submissions for each row execute function public.set_updated_at();
drop trigger if exists attendance_updated on public.attendance;
create trigger attendance_updated before update on public.attendance for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  student_role_id uuid;
begin
  insert into public.profiles(id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  );
  select id into student_role_id from public.roles where name = 'student';
  insert into public.profile_roles(profile_id, role_id) values (new.id, student_role_id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Authorization helpers
create or replace function public.has_role(requested_role public.app_role)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = auth.uid() and r.name = requested_role
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.has_role('super_admin') or public.has_role('admin');
$$;

grant execute on function public.has_role(public.app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.courses enable row level security;
alter table public.batches enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_batches enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_files enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.submission_files enable row level security;
alter table public.attendance enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "roles readable by authenticated" on public.roles;
create policy "roles readable by authenticated" on public.roles for select to authenticated using (true);
drop policy if exists "roles managed by super admin" on public.roles;
create policy "roles managed by super admin" on public.roles for all to authenticated using (public.has_role('super_admin')) with check (public.has_role('super_admin'));

drop policy if exists "profiles visible to authenticated" on public.profiles;
create policy "profiles visible to authenticated" on public.profiles for select to authenticated using (true);
drop policy if exists "own profile editable" on public.profiles;
create policy "own profile editable" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "profiles managed by admins" on public.profiles;
create policy "profiles managed by admins" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "own roles visible" on public.profile_roles;
create policy "own roles visible" on public.profile_roles for select to authenticated using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "roles assigned by admins" on public.profile_roles;
create policy "roles assigned by admins" on public.profile_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "courses readable" on public.courses;
create policy "courses readable" on public.courses for select to authenticated using (true);
drop policy if exists "courses managed by admins" on public.courses;
create policy "courses managed by admins" on public.courses for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "batches readable" on public.batches;
create policy "batches readable" on public.batches for select to authenticated using (true);
drop policy if exists "batches managed by admins" on public.batches;
create policy "batches managed by admins" on public.batches for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "students visible to staff or self" on public.students;
create policy "students visible to staff or self" on public.students for select to authenticated
using (public.is_admin() or public.has_role('teacher') or profile_id = auth.uid());
drop policy if exists "students managed by admins" on public.students;
create policy "students managed by admins" on public.students for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "teachers visible to authenticated" on public.teachers;
create policy "teachers visible to authenticated" on public.teachers for select to authenticated using (true);
drop policy if exists "teachers managed by admins" on public.teachers;
create policy "teachers managed by admins" on public.teachers for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "teacher batches readable" on public.teacher_batches;
create policy "teacher batches readable" on public.teacher_batches for select to authenticated using (true);
drop policy if exists "teacher batches managed by admins" on public.teacher_batches;
create policy "teacher batches managed by admins" on public.teacher_batches for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published assignments visible" on public.assignments;
create policy "published assignments visible" on public.assignments for select to authenticated
using (status = 'published' or public.is_admin() or created_by = auth.uid());
drop policy if exists "assignments created by staff" on public.assignments;
create policy "assignments created by staff" on public.assignments for insert to authenticated
with check ((public.is_admin() or public.has_role('teacher')) and created_by = auth.uid());
drop policy if exists "assignments updated by owner or admin" on public.assignments;
create policy "assignments updated by owner or admin" on public.assignments for update to authenticated
using (created_by = auth.uid() or public.is_admin()) with check (created_by = auth.uid() or public.is_admin());
drop policy if exists "assignments deleted by owner or admin" on public.assignments;
create policy "assignments deleted by owner or admin" on public.assignments for delete to authenticated
using (created_by = auth.uid() or public.is_admin());
drop policy if exists "assignment files readable" on public.assignment_files;
create policy "assignment files readable" on public.assignment_files for select to authenticated using (true);
drop policy if exists "assignment files managed by staff" on public.assignment_files;
create policy "assignment files managed by staff" on public.assignment_files for all to authenticated
using (public.is_admin() or public.has_role('teacher')) with check (public.is_admin() or public.has_role('teacher'));

drop policy if exists "submissions visible to owner and staff" on public.assignment_submissions;
create policy "submissions visible to owner and staff" on public.assignment_submissions for select to authenticated
using (
  public.is_admin() or public.has_role('teacher') or
  exists(select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid())
);
drop policy if exists "students create own submissions" on public.assignment_submissions;
create policy "students create own submissions" on public.assignment_submissions for insert to authenticated
with check (exists(select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid()));
drop policy if exists "submissions updated by owner or staff" on public.assignment_submissions;
create policy "submissions updated by owner or staff" on public.assignment_submissions for update to authenticated
using (
  public.is_admin() or public.has_role('teacher') or
  exists(select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid())
);
drop policy if exists "submission files follow submission access" on public.submission_files;
create policy "submission files follow submission access" on public.submission_files for select to authenticated
using (exists(select 1 from public.assignment_submissions sub where sub.id = submission_id));
drop policy if exists "submission files created by students" on public.submission_files;
create policy "submission files created by students" on public.submission_files for insert to authenticated
with check (exists(select 1 from public.assignment_submissions sub join public.students s on s.id = sub.student_id where sub.id = submission_id and s.profile_id = auth.uid()));

drop policy if exists "attendance visible to staff or student" on public.attendance;
create policy "attendance visible to staff or student" on public.attendance for select to authenticated
using (
  public.is_admin() or public.has_role('teacher') or
  exists(select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid())
);
drop policy if exists "attendance marked by staff" on public.attendance;
create policy "attendance marked by staff" on public.attendance for insert to authenticated
with check ((public.is_admin() or public.has_role('teacher')) and marked_by = auth.uid());
drop policy if exists "attendance updated by staff" on public.attendance;
create policy "attendance updated by staff" on public.attendance for update to authenticated
using (public.is_admin() or public.has_role('teacher')) with check (public.is_admin() or public.has_role('teacher'));

drop policy if exists "own notifications visible" on public.notifications;
create policy "own notifications visible" on public.notifications for select to authenticated using (recipient_id = auth.uid());
drop policy if exists "own notifications updateable" on public.notifications;
create policy "own notifications updateable" on public.notifications for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
drop policy if exists "notifications created by staff" on public.notifications;
create policy "notifications created by staff" on public.notifications for insert to authenticated with check (public.is_admin() or public.has_role('teacher'));
drop policy if exists "activity visible to admins" on public.activity_logs;
create policy "activity visible to admins" on public.activity_logs for select to authenticated using (public.is_admin());
drop policy if exists "activity created by authenticated" on public.activity_logs;
create policy "activity created by authenticated" on public.activity_logs for insert to authenticated with check (actor_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('assignment-files', 'assignment-files', false, 15728640, array['application/pdf','image/jpeg','image/png','image/webp']),
  ('submission-files', 'submission-files', false, 15728640, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "avatar images public" on storage.objects;
create policy "avatar images public" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "users manage own avatar" on storage.objects;
create policy "users manage own avatar" on storage.objects for all to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "assignment files readable by authenticated" on storage.objects;
create policy "assignment files readable by authenticated" on storage.objects for select to authenticated using (bucket_id = 'assignment-files');
drop policy if exists "staff manage assignment files" on storage.objects;
create policy "staff manage assignment files" on storage.objects for all to authenticated
using (bucket_id = 'assignment-files' and (public.is_admin() or public.has_role('teacher')))
with check (bucket_id = 'assignment-files' and (public.is_admin() or public.has_role('teacher')));
drop policy if exists "submission files readable by authenticated" on storage.objects;
create policy "submission files readable by authenticated" on storage.objects for select to authenticated using (bucket_id = 'submission-files');
drop policy if exists "students upload own submission files" on storage.objects;
create policy "students upload own submission files" on storage.objects for insert to authenticated
with check (bucket_id = 'submission-files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "students manage own submission files" on storage.objects;
create policy "students manage own submission files" on storage.objects for update to authenticated
using (bucket_id = 'submission-files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "students delete own submission files" on storage.objects;
create policy "students delete own submission files" on storage.objects for delete to authenticated
using (bucket_id = 'submission-files' and (storage.foldername(name))[1] = auth.uid()::text);


insert into public.courses(name, code, description, duration_months)
values
  ('Web Development', 'WD-01', 'Modern full-stack web development', 12),
  ('Graphic Design', 'GD-01', 'Visual design and digital media', 6)
on conflict (code) do nothing;

insert into public.batches(course_id, name, timing, start_date, end_date)
select id, 'Morning 2026', '09:00-11:00', '2026-01-05', '2026-12-18'
from public.courses where code = 'WD-01'
on conflict (course_id, name) do nothing;




