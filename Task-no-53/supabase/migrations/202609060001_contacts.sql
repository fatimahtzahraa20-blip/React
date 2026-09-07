create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  created_at timestamptz not null default now()
);
alter table public.contacts enable row level security;
-- Inserts are restricted to trusted server/database administrators by default.
-- Add an appropriately scoped RLS policy before integrating a browser insert flow.
