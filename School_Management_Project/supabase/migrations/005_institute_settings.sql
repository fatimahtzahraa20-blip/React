-- Institute branding: a single configurable row (name + logo) that Admins/Super Admins
-- can edit from Settings, and that every signed-in and signed-out screen reads.

create table if not exists public.institute_settings (
  id smallint primary key default 1,
  institute_name text not null default 'School',
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint institute_settings_singleton check (id = 1)
);

alter table public.institute_settings enable row level security;

drop policy if exists "institute settings readable by everyone" on public.institute_settings;
create policy "institute settings readable by everyone"
on public.institute_settings for select
using (true);

drop policy if exists "institute settings managed by admins" on public.institute_settings;
create policy "institute settings managed by admins"
on public.institute_settings for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists institute_settings_updated on public.institute_settings;
create trigger institute_settings_updated
before update on public.institute_settings
for each row execute function public.set_updated_at();

insert into public.institute_settings (id, institute_name)
values (1, 'School')
on conflict (id) do nothing;

-- Branding logo storage: publicly readable, writable only by Admins/Super Admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 2097152, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

drop policy if exists "branding images public" on storage.objects;
create policy "branding images public" on storage.objects for select
using (bucket_id = 'branding');

drop policy if exists "admins manage branding images" on storage.objects;
create policy "admins manage branding images" on storage.objects for all to authenticated
using (bucket_id = 'branding' and public.is_admin())
with check (bucket_id = 'branding' and public.is_admin());
