-- Production foundation for the CS Course Allocation & Faculty Workload Management System.
-- Apply to a NEW Supabase project after schema.sql, or adapt as a migration for existing data.

create extension if not exists "uuid-ossp";

do $$ begin create type public.session_status as enum ('planning','allocation_in_progress','ready_for_review','hod_review','approved','reopened'); exception when duplicate_object then null; end $$;
do $$ begin create type public.offering_status as enum ('unallocated','draft','allocated','conflict','submitted_for_review','approved'); exception when duplicate_object then null; end $$;
do $$ begin create type public.scope_access as enum ('none','view','allocate','manage'); exception when duplicate_object then null; end $$;
do $$ begin create type public.faculty_type as enum ('permanent','visiting','other_department','lab_support'); exception when duplicate_object then null; end $$;

create table if not exists public.academic_sessions (
  id uuid primary key default uuid_generate_v4(), code text not null unique check (code ~ '^[A-Z]{2}[0-9]{2}$'),
  title text not null, starts_on date, ends_on date, status public.session_status not null default 'planning',
  created_by uuid references public.profiles(id), created_at timestamptz not null default now(), approved_at timestamptz, approved_by uuid references public.profiles(id)
);

create table if not exists public.session_programmes (
  id uuid primary key default uuid_generate_v4(), session_id uuid not null references public.academic_sessions(id) on delete cascade,
  programme_id uuid not null references public.programmes(id), active boolean not null default true, unique(session_id, programme_id)
);

create table if not exists public.semesters (
  id uuid primary key default uuid_generate_v4(), programme_id uuid not null references public.programmes(id) on delete cascade,
  number integer not null check(number between 1 and 12), name text, unique(programme_id, number)
);

create table if not exists public.sections (
  id uuid primary key default uuid_generate_v4(), session_id uuid not null references public.academic_sessions(id) on delete cascade,
  programme_id uuid not null references public.programmes(id), semester_id uuid references public.semesters(id), name text not null, active boolean not null default true,
  unique(session_id, programme_id, semester_id, name)
);

alter table public.faculty add column if not exists faculty_code text;
alter table public.faculty add column if not exists designation text;
alter table public.faculty add column if not exists faculty_type public.faculty_type not null default 'permanent';
alter table public.faculty add column if not exists primary_programme_id uuid references public.programmes(id);
alter table public.faculty add column if not exists target_credits numeric not null default 12;
alter table public.faculty add column if not exists theory_eligible boolean not null default true;
alter table public.faculty add column if not exists lab_eligible boolean not null default true;
alter table public.faculty add column if not exists active boolean not null default true;
alter table public.faculty add column if not exists notes text;

create table if not exists public.faculty_programmes (
  faculty_id uuid not null references public.faculty(id) on delete cascade, programme_id uuid not null references public.programmes(id) on delete cascade,
  access public.scope_access not null default 'view', is_primary boolean not null default false, primary key(faculty_id, programme_id)
);

alter table public.courses add column if not exists theory_hours numeric not null default 0;
alter table public.courses add column if not exists lab_hours numeric not null default 0;
alter table public.courses add column if not exists credit_format text;
alter table public.courses add column if not exists course_type text;
alter table public.courses add column if not exists category text;
alter table public.courses add column if not exists required_expertise text[] not null default '{}';
alter table public.courses add column if not exists lab_required boolean not null default false;
alter table public.courses add column if not exists notes text;

alter table public.course_offerings add column if not exists session_id uuid references public.academic_sessions(id) on delete cascade;
alter table public.course_offerings add column if not exists semester_id uuid references public.semesters(id);
alter table public.course_offerings add column if not exists section_id uuid references public.sections(id);
alter table public.course_offerings add column if not exists status public.offering_status not null default 'unallocated';
alter table public.course_offerings add column if not exists previous_faculty_id uuid references public.faculty(id);
alter table public.course_offerings add column if not exists locked boolean not null default false;

create table if not exists public.workload_rules (
  id uuid primary key default uuid_generate_v4(), designation text not null unique, min_load numeric not null default 0,
  target_load numeric not null default 12, max_load numeric not null default 12, theory_weight numeric not null default 1,
  lab_weight numeric not null default 1, updated_at timestamptz not null default now(), updated_by uuid references public.profiles(id)
);

create table if not exists public.team_scopes (
  id uuid primary key default uuid_generate_v4(), profile_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid references public.programmes(id) on delete cascade, semester_id uuid references public.semesters(id) on delete cascade,
  section_id uuid references public.sections(id) on delete cascade, access public.scope_access not null default 'none',
  allocation_limit integer, active boolean not null default true
);

create table if not exists public.team_permissions (
  profile_id uuid not null references public.profiles(id) on delete cascade, permission text not null,
  allowed boolean not null default false, primary key(profile_id, permission)
);

create table if not exists public.allocation_history (
  id uuid primary key default uuid_generate_v4(), offering_id uuid not null references public.course_offerings(id) on delete cascade,
  previous_faculty_id uuid references public.faculty(id), new_faculty_id uuid references public.faculty(id),
  action text not null, changed_by uuid references public.profiles(id), changed_at timestamptz not null default now(), note text
);

create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(), actor_id uuid references public.profiles(id), action text not null,
  entity_type text not null, entity_id uuid, session_id uuid references public.academic_sessions(id), programme_id uuid references public.programmes(id),
  semester_id uuid references public.semesters(id), section_id uuid references public.sections(id), previous_value jsonb, new_value jsonb, created_at timestamptz not null default now()
);

create table if not exists public.approval_records (
  id uuid primary key default uuid_generate_v4(), session_id uuid not null references public.academic_sessions(id) on delete cascade,
  action text not null check(action in ('submitted','approved','reopened')), note text, actor_id uuid references public.profiles(id), created_at timestamptz not null default now()
);

create index if not exists course_offerings_session_idx on public.course_offerings(session_id);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);
create index if not exists allocation_history_offering_idx on public.allocation_history(offering_id, changed_at desc);

create or replace function public.workload_for_faculty(p_faculty_id uuid, p_session_id uuid)
returns table(theory_load numeric, lab_load numeric, total_load numeric, sections integer)
language sql stable security definer set search_path = public as $$
  select coalesce(sum(c.theory_hours),0), coalesce(sum(c.lab_hours),0), coalesce(sum(a.assigned_credits),0), count(a.id)::integer
  from allocations a join course_offerings o on o.id=a.course_offering_id join courses c on c.id=o.course_id
  where a.faculty_id=p_faculty_id and o.session_id=p_session_id and a.status='allocated';
$$;

create or replace function public.approve_session(p_session_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if (select role from profiles where id=auth.uid()) <> 'hod' and (select role from profiles where id=auth.uid()) <> 'admin' then
    raise exception 'Only the HOD can approve an allocation';
  end if;
  update academic_sessions set status='approved', approved_at=now(), approved_by=auth.uid() where id=p_session_id;
  update course_offerings set status='approved', locked=true where session_id=p_session_id and status in ('allocated','submitted_for_review');
  insert into approval_records(session_id,action,actor_id) values(p_session_id,'approved',auth.uid());
end $$;

alter table public.academic_sessions enable row level security;
alter table public.session_programmes enable row level security;
alter table public.semesters enable row level security;
alter table public.sections enable row level security;
alter table public.faculty_programmes enable row level security;
alter table public.workload_rules enable row level security;
alter table public.team_scopes enable row level security;
alter table public.team_permissions enable row level security;
alter table public.allocation_history enable row level security;
alter table public.activity_logs enable row level security;
alter table public.approval_records enable row level security;

create policy "authenticated session read" on public.academic_sessions for select to authenticated using (true);
create policy "authenticated history read" on public.allocation_history for select to authenticated using (true);
create policy "authenticated activity read" on public.activity_logs for select to authenticated using (true);
create policy "hod manages sessions" on public.academic_sessions for all to authenticated using ((select role from public.profiles where id=auth.uid()) in ('hod','admin')) with check ((select role from public.profiles where id=auth.uid()) in ('hod','admin'));