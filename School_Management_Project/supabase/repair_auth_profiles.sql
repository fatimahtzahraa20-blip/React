-- Repair Auth users that were created before the Northstar profile trigger.
-- Safe to run more than once in Supabase Dashboard > SQL Editor.

insert into public.roles (name, description)
values
  ('super_admin', 'Full platform access'),
  ('admin', 'Institute administration access'),
  ('teacher', 'Teaching and class management access'),
  ('student', 'Student self-service access')
on conflict (name) do nothing;

insert into public.profiles (id, full_name, email)
select
  user_account.id,
  coalesce(
    nullif(user_account.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(coalesce(user_account.email, ''), '@', 1), ''),
    'Northstar User'
  ),
  coalesce(user_account.email, user_account.id::text || '@local.invalid')
from auth.users as user_account
left join public.profiles as profile on profile.id = user_account.id
where profile.id is null
on conflict (id) do nothing;

insert into public.profile_roles (profile_id, role_id)
select profile.id, role_record.id
from public.profiles as profile
cross join public.roles as role_record
where role_record.name = 'student'
  and not exists (
    select 1
    from public.profile_roles as existing_role
    where existing_role.profile_id = profile.id
  )
on conflict do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  student_role_id uuid;
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Northstar User'
    ),
    coalesce(new.email, new.id::text || '@local.invalid')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email;

  select id
  into student_role_id
  from public.roles
  where name = 'student';

  if student_role_id is null then
    raise exception 'The student role is missing from public.roles';
  end if;

  if not exists (
    select 1
    from public.profile_roles
    where profile_id = new.id
  ) then
    insert into public.profile_roles (profile_id, role_id)
    values (new.id, student_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

select
  user_account.email,
  profile.full_name,
  array_agg(role_record.name order by role_record.name) as roles
from auth.users as user_account
join public.profiles as profile on profile.id = user_account.id
left join public.profile_roles as profile_role on profile_role.profile_id = profile.id
left join public.roles as role_record on role_record.id = profile_role.role_id
group by user_account.email, profile.full_name
order by user_account.email;
