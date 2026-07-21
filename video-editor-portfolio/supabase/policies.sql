-- ============================================
-- Admin Users
-- ============================================

create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- ============================================
-- Admin Check Function
-- ============================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.admin_users
        where user_id = auth.uid()
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to authenticated;

-- ============================================
-- Enable Row Level Security
-- ============================================

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.videos enable row level security;
alter table public.contacts enable row level security;
alter table public.portfolio_settings enable row level security;

-- ============================================
-- Remove Existing Policies
-- ============================================

drop policy if exists "Public can read categories"
on public.categories;

drop policy if exists "Admin can manage categories"
on public.categories;

drop policy if exists "Public can read subcategories"
on public.subcategories;

drop policy if exists "Admin can manage subcategories"
on public.subcategories;

drop policy if exists "Public can read videos"
on public.videos;

drop policy if exists "Admin can manage videos"
on public.videos;

drop policy if exists "Public can submit contact messages"
on public.contacts;

drop policy if exists "Admin can read contact messages"
on public.contacts;

drop policy if exists "Admin can delete contact messages"
on public.contacts;

drop policy if exists "Public can read portfolio settings"
on public.portfolio_settings;

drop policy if exists "Admin can manage portfolio settings"
on public.portfolio_settings;

drop policy if exists "Admin can view admin users"
on public.admin_users;

-- Remove policies from the earlier version
drop policy if exists "Public read categories"
on public.categories;

drop policy if exists "Public read videos"
on public.videos;

drop policy if exists "Public read settings"
on public.portfolio_settings;

drop policy if exists "Anyone can insert contact message"
on public.contacts;

drop policy if exists "Authenticated manage categories"
on public.categories;

drop policy if exists "Authenticated manage videos"
on public.videos;

drop policy if exists "Authenticated manage settings"
on public.portfolio_settings;

drop policy if exists "Authenticated read contacts"
on public.contacts;

drop policy if exists "Authenticated delete contacts"
on public.contacts;

-- ============================================
-- Admin Users Policies
-- ============================================

create policy "Admin can view admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

-- ============================================
-- Categories Policies
-- ============================================

create policy "Public can read categories"
on public.categories
for select
to anon, authenticated
using (true);

create policy "Admin can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================
-- Subcategories Policies
-- ============================================

create policy "Public can read subcategories"
on public.subcategories
for select
to anon, authenticated
using (true);

create policy "Admin can manage subcategories"
on public.subcategories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================
-- Videos Policies
-- ============================================

create policy "Public can read videos"
on public.videos
for select
to anon, authenticated
using (true);

create policy "Admin can manage videos"
on public.videos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================
-- Contact Message Policies
-- ============================================

create policy "Public can submit contact messages"
on public.contacts
for insert
to anon, authenticated
with check (
    char_length(trim(name)) between 2 and 100
    and char_length(trim(email)) between 5 and 255
    and char_length(trim(subject)) between 3 and 200
    and char_length(trim(message)) between 10 and 3000
);

create policy "Admin can read contact messages"
on public.contacts
for select
to authenticated
using (public.is_admin());

create policy "Admin can delete contact messages"
on public.contacts
for delete
to authenticated
using (public.is_admin());

-- ============================================
-- Portfolio Settings Policies
-- ============================================

create policy "Public can read portfolio settings"
on public.portfolio_settings
for select
to anon, authenticated
using (true);

create policy "Admin can manage portfolio settings"
on public.portfolio_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());