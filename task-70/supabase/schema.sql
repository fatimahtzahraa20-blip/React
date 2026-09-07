-- Task 80 uses its own table to avoid collisions with other apps' items tables.
-- Run the entire script in the Supabase SQL Editor.
begin;

create table if not exists public.task80_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  sku text not null unique check (char_length(sku) between 1 and 80),
  created_at timestamptz not null default now()
);

alter table public.task80_items enable row level security;
revoke all on table public.task80_items from anon, authenticated;
grant select, insert on table public.task80_items to service_role;

insert into public.task80_items (name, sku) values
  ('Widget', 'WID-1'), ('Gadget', 'GAD-1')
on conflict (sku) do nothing;

commit;

