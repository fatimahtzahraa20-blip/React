-- ONE-TIME DESTRUCTIVE CLEANUP
-- Removes every Auth account except accounts currently assigned the super_admin role.
-- Role definitions are preserved so new Teacher and Student accounts can be created later.
-- Run this file manually in Supabase Dashboard > SQL Editor. Do not add it as a migration.

begin;

create temporary table keep_super_admins (
  profile_id uuid primary key
) on commit drop;

insert into keep_super_admins (profile_id)
select distinct profile_role.profile_id
from public.profile_roles profile_role
join public.roles role on role.id = profile_role.role_id
where role.name = 'super_admin';

do $$
begin
  if not exists (select 1 from keep_super_admins) then
    raise exception 'Cleanup cancelled: no account with the super_admin role was found.';
  end if;
end
$$;

-- Records with RESTRICT foreign keys must be removed before their creators/markers.
-- Assignment and student cascades remove related submissions and file metadata.
delete from public.assignments assignment
where not exists (
  select 1 from keep_super_admins keeper where keeper.profile_id = assignment.created_by
);

delete from public.attendance attendance_record
where not exists (
  select 1 from keep_super_admins keeper where keeper.profile_id = attendance_record.marked_by
);

-- Remove any secondary role accidentally assigned to a preserved Super Admin.
delete from public.profile_roles profile_role
using public.roles role
where profile_role.role_id = role.id
  and profile_role.profile_id in (select profile_id from keep_super_admins)
  and role.name <> 'super_admin';

-- Deleting Auth users cascades through profiles, profile_roles, students, teachers,
-- teacher_batches, notifications, preferences, and their dependent records.
delete from auth.users auth_user
where not exists (
  select 1 from keep_super_admins keeper where keeper.profile_id = auth_user.id
);

-- Abort instead of committing if cleanup did not leave a valid Super Admin profile.
do $$
begin
  if exists (
    select 1
    from keep_super_admins keeper
    left join auth.users auth_user on auth_user.id = keeper.profile_id
    left join public.profiles profile on profile.id = keeper.profile_id
    where auth_user.id is null or profile.id is null
  ) then
    raise exception 'Cleanup validation failed: a preserved Super Admin record is incomplete.';
  end if;
end
$$;

commit;

-- Verification result: only preserved Super Admin accounts should be returned.
select
  auth_user.id,
  auth_user.email,
  profile.full_name,
  array_agg(role.name order by role.name) as roles
from auth.users auth_user
join public.profiles profile on profile.id = auth_user.id
join public.profile_roles profile_role on profile_role.profile_id = profile.id
join public.roles role on role.id = profile_role.role_id
group by auth_user.id, auth_user.email, profile.full_name
order by auth_user.email;