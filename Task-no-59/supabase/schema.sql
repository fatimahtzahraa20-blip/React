create table public.checkout_sessions (
  stripe_session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 10),
  amount_total bigint,
  currency text,
  created_at timestamptz not null default now()
);
alter table public.checkout_sessions enable row level security;
revoke all on public.checkout_sessions from anon, authenticated;
grant select on public.checkout_sessions to authenticated;
create policy "Users can read their checkout sessions"
on public.checkout_sessions for select to authenticated
using ((select auth.uid()) = user_id);
