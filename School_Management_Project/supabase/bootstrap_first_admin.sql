-- Run after the account has signed up.
-- Replace the email below with the first administrator's actual email.
do $$
declare
  target_user_id uuid;
  super_admin_role_id uuid;
  student_role_id uuid;
begin
  select id into target_user_id
  from auth.users
  where lower(email) = lower('admin@example.com');

  if target_user_id is null then
    raise exception 'No authenticated user found for that email';
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
