-- Promote fatima@gmail.com to Super Admin.
--
-- IMPORTANT: run this AFTER fatima@gmail.com has signed up once through the
-- app's normal Signup page (this creates her row in auth.users and
-- public.profiles with the default "student" role). This script then swaps
-- her role to super_admin so she can manage everything: users, roles,
-- courses, batches, teachers, students, reports, and now Institute branding.
--
-- Safe to re-run.

do $$
declare
  target_user_id uuid;
  super_admin_role_id uuid;
  student_role_id uuid;
begin
  select id into target_user_id
  from auth.users
  where lower(email) = lower('fatima@gmail.com');

  if target_user_id is null then
    raise exception 'No signed-up user found for fatima@gmail.com. Ask Fatima to sign up first, then re-run this script.';
  end if;

  select id into super_admin_role_id
  from public.roles
  where name = 'super_admin';

  select id into student_role_id
  from public.roles
  where name = 'student';

  insert into public.profile_roles(profile_id, role_id)
  values (target_user_id, super_admin_role_id)
  on conflict do nothing;

  delete from public.profile_roles
  where profile_id = target_user_id
    and role_id = student_role_id;
end;
$$;
