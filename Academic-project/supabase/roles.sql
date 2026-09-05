-- Safe follow-up migration. Run this AFTER schema.sql; do not rerun schema.sql.
-- It is safe to run this file more than once.

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, initials, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'full_name', new.email), 2)),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'faculty')
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Backfill Auth users created before the trigger was installed.
insert into public.profiles (id, full_name, initials, role)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), upper(left(coalesce(u.raw_user_meta_data->>'full_name', u.email), 2)), coalesce((u.raw_user_meta_data->>'role')::public.app_role, 'faculty')
from auth.users u
on conflict (id) do nothing;

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles for update to authenticated
using ((select role from public.profiles where id = auth.uid()) = 'admin')
with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Promote the first user after they have signed up:
-- update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
-- Deploy the invitation function: supabase functions deploy invite-user
