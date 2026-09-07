-- Safe to run alongside the existing Stripe table; preserves previous records.
create table if not exists public.safepay_checkout_sessions (
  order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 10),
  amount bigint not null check (amount > 0),
  currency text not null check (currency in ('PKR', 'USD')),
  payment_token text unique,
  checkout_url text,
  created_at timestamptz not null default now()
);
alter table public.safepay_checkout_sessions enable row level security;
revoke all on public.safepay_checkout_sessions from anon, authenticated;
grant select on public.safepay_checkout_sessions to authenticated;
grant all on public.safepay_checkout_sessions to service_role;
drop policy if exists "Users read own Safepay sessions" on public.safepay_checkout_sessions;
create policy "Users read own Safepay sessions"
on public.safepay_checkout_sessions for select to authenticated
using ((select auth.uid()) = user_id);
