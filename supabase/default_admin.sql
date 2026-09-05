-- Development-only default administrator setup.
-- Run schema.sql and roles.sql first. Change this password before production.
create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'Main@gmail.com';
  if admin_id is null then
    admin_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'Main@gmail.com', crypt('admin123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"System Administrator","role":"admin"}', now(), now(),
      '', '', '', ''
    );
  end if;
  insert into public.profiles (id, full_name, initials, role)
  values (admin_id, 'System Administrator', 'SA', 'admin')
  on conflict (id) do update set role = 'admin', full_name = excluded.full_name, initials = excluded.initials;
end $$;
