-- Northstar School Management - normalized PostgreSQL schema
create extension if not exists "pgcrypto";

create type public.app_role as enum ('super_admin', 'admin', 'teacher', 'student');
create type public.assignment_status as enum ('draft', 'published', 'closed');
create type public.submission_status as enum ('submitted', 'reviewed', 'returned');
create type public.attendance_status as enum ('present', 'absent', 'late', 'leave');

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.app_role not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, role_id)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  duration_months integer check (duration_months > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.batches (
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

create table public.students (
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

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  employee_id text not null unique,
  specialization text,
  joining_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_batches (
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, batch_id)
);

create table public.assignments (
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

create table public.assignment_files (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table public.assignment_submissions (
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

create table public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.assignment_submissions(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table public.attendance (
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

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index students_course_idx on public.students(course_id);
create index students_batch_idx on public.students(batch_id);
create index assignments_batch_due_idx on public.assignments(batch_id, due_at);
create index submissions_assignment_idx on public.assignment_submissions(assignment_id);
create index attendance_batch_date_idx on public.attendance(batch_id, attendance_date);
create index notifications_recipient_idx on public.notifications(recipient_id, created_at desc);
create index activity_logs_created_idx on public.activity_logs(created_at desc);

insert into public.roles(name, description) values
  ('super_admin', 'Full platform access'),
  ('admin', 'Institute administration access'),
  ('teacher', 'Teaching and class management access'),
  ('student', 'Student self-service access')
on conflict (name) do nothing;

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger courses_updated before update on public.courses for each row execute function public.set_updated_at();
create trigger batches_updated before update on public.batches for each row execute function public.set_updated_at();
create trigger students_updated before update on public.students for each row execute function public.set_updated_at();
create trigger teachers_updated before update on public.teachers for each row execute function public.set_updated_at();
create trigger assignments_updated before update on public.assignments for each row execute function public.set_updated_at();
create trigger submissions_updated before update on public.assignment_submissions for each row execute function public.set_updated_at();
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
