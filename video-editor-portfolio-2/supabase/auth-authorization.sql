-- Run this once in the Supabase SQL editor after schema.sql.
-- It adds the account approval and video-submission workflow used by the app.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  can_upload boolean not null default false,
  is_active boolean not null default true,
  phone text,
  country text,
  website text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, email, role, approval_status, can_upload, is_active
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    case when lower(new.email) = 'fatimahtzahraa2.0@gmail.com' then 'admin' else 'user' end,
    case when lower(new.email) = 'fatimahtzahraa2.0@gmail.com' then 'approved' else 'pending' end,
    lower(new.email) = 'fatimahtzahraa2.0@gmail.com',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

-- Make the designated portfolio owner an administrator if the account already exists.
update public.profiles
set role = 'admin', approval_status = 'approved', can_upload = true, is_active = true
where lower(email) = 'fatimahtzahraa2.0@gmail.com';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

create or replace function public.can_submit_video()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active = true
      and approval_status = 'approved'
      and (role = 'admin' or can_upload = true)
  );
$$;

alter table public.videos add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.videos add column if not exists approval_status text not null default 'pending'
  check (approval_status in ('pending', 'approved', 'rejected'));
alter table public.videos add column if not exists sub_category_id uuid references public.subcategories(id) on delete set null;
alter table public.videos add column if not exists cloudinary_video_public_id text;
alter table public.videos add column if not exists cloudinary_thumbnail_public_id text;

alter table public.videos drop constraint if exists videos_video_source_check;
alter table public.videos add constraint videos_video_source_check
  check (video_source in ('youtube', 'google_drive', 'cloudinary', 'direct_url'));

create or replace function public.assign_video_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    new.slug := regexp_replace(lower(coalesce(new.title, 'video')), '[^a-z0-9]+', '-', 'g')
      || '-' || left(new.id::text, 8);
  end if;
  return new;
end;
$$;

drop trigger if exists assign_video_slug_before_insert on public.videos;
create trigger assign_video_slug_before_insert
  before insert on public.videos
  for each row execute function public.assign_video_slug();

-- Keep portfolio videos that existed before the workflow publicly visible.
update public.videos set approval_status = 'approved' where approval_status is null;

alter table public.profiles enable row level security;

drop policy if exists "Users can view their profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;

create policy "Users can view their profile" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "Admins can view all profiles" on public.profiles
  for select to authenticated using (public.is_admin());
create policy "Users can update their profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins can manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- A signed-in user may edit their public profile details, but cannot elevate
-- their own role, approve themselves, enable uploads, or reactivate an account.
create or replace function public.protect_profile_authorization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and (
    new.role is distinct from old.role
    or new.approval_status is distinct from old.approval_status
    or new.can_upload is distinct from old.can_upload
    or new.is_active is distinct from old.is_active
  ) then
    raise exception 'Only an administrator can change account authorization.';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_authorization_before_update on public.profiles;
create trigger protect_profile_authorization_before_update
  before update on public.profiles
  for each row execute function public.protect_profile_authorization();

drop policy if exists "Public can read videos" on public.videos;
drop policy if exists "Admin can manage videos" on public.videos;
drop policy if exists "Public can read approved videos" on public.videos;
drop policy if exists "Users can view own videos" on public.videos;
drop policy if exists "Authorized users can submit videos" on public.videos;
drop policy if exists "Users can edit pending videos" on public.videos;
drop policy if exists "Admins can manage all videos" on public.videos;

create policy "Public can read approved videos" on public.videos
  for select to anon, authenticated using (approval_status = 'approved');
create policy "Users can view own videos" on public.videos
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "Authorized users can submit videos" on public.videos
  for insert to authenticated with check (
    user_id = auth.uid()
    and public.can_submit_video()
    and (public.is_admin() or approval_status = 'pending')
  );
create policy "Users can edit pending videos" on public.videos
  for update to authenticated using (user_id = auth.uid() and approval_status = 'pending')
  with check (user_id = auth.uid() and approval_status = 'pending');
create policy "Admins can manage all videos" on public.videos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- The designated admin account is fatimahtzahraa2.0@gmail.com.
