-- Apply once using the Supabase SQL Editor or Supabase CLI migrations.
begin;

create table public.payment_accounts (
  tenant_id text not null,
  account_id text not null,
  balance_cents bigint not null default 0 check (balance_cents between -9007199254740991 and 9007199254740991),
  primary key (tenant_id, account_id)
);
create table public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  idempotency_key text not null,
  account_id text not null,
  amount_cents bigint not null check (amount_cents between 1 and 9007199254740991),
  currency text not null check (currency = 'USD'),
  status text not null default 'paid' check (status = 'paid'),
  created_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key),
  foreign key (tenant_id, account_id) references public.payment_accounts (tenant_id, account_id)
);
create table public.payment_idempotency (
  tenant_id text not null,
  key text not null,
  request_body jsonb not null,
  response_body jsonb not null,
  status_code integer not null,
  order_id uuid not null references public.payment_orders(id),
  created_at timestamptz not null default now(),
  primary key (tenant_id, key)
);

alter table public.payment_accounts enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_idempotency enable row level security;
revoke all on public.payment_accounts, public.payment_orders, public.payment_idempotency from public, anon, authenticated;
grant select, insert, update on public.payment_accounts, public.payment_orders, public.payment_idempotency to service_role;

create function public.create_payment(
  p_tenant_id text, p_key text, p_account_id text, p_amount_cents bigint, p_currency text default 'USD'
) returns jsonb
language plpgsql
security invoker
set search_path = ''
set lock_timeout = '5s'
as $$
declare
  v_request jsonb;
  v_existing public.payment_idempotency%rowtype;
  v_balance bigint;
  v_order_id uuid;
  v_response jsonb;
begin
  if p_tenant_id is null or length(btrim(p_tenant_id)) = 0 or length(p_tenant_id) > 200
    or p_key is null or length(p_key) not between 1 and 200 or p_key ~ '[^!-~]'
    or p_account_id is null or length(btrim(p_account_id)) = 0 or length(p_account_id) > 200
    or p_amount_cents is null or p_amount_cents not between 1 and 9007199254740991
    or p_currency is distinct from 'USD' then
    raise exception 'INVALID_PAYMENT_INPUT' using errcode = '22023';
  end if;
  v_request := jsonb_build_object('accountId', p_account_id, 'amountCents', p_amount_cents, 'currency', p_currency);

  -- Transaction-scoped lock serializes the same tenant/key across API processes.
  -- Hash collisions only serialize unrelated requests; exact keys still define identity.
  perform pg_advisory_xact_lock(hashtextextended(jsonb_build_array(p_tenant_id, p_key)::text, 0));
  select * into v_existing from public.payment_idempotency
    where tenant_id = p_tenant_id and key = p_key;
  if found then
    if v_existing.request_body <> v_request then
      return jsonb_build_object('status_code', 422, 'replayed', false,
        'body', jsonb_build_object('error', 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD'));
    end if;
    return jsonb_build_object('status_code', v_existing.status_code, 'body', v_existing.response_body, 'replayed', true);
  end if;

  insert into public.payment_accounts (tenant_id, account_id)
    values (p_tenant_id, p_account_id) on conflict (tenant_id, account_id) do nothing;
  -- Different payment keys on the same account must not lose balance updates.
  select balance_cents into v_balance from public.payment_accounts
    where tenant_id = p_tenant_id and account_id = p_account_id for update;
  if v_balance - p_amount_cents < -9007199254740991 then
    raise exception 'BALANCE_LIMIT_EXCEEDED';
  end if;
  update public.payment_accounts set balance_cents = balance_cents - p_amount_cents
    where tenant_id = p_tenant_id and account_id = p_account_id;
  insert into public.payment_orders (tenant_id, idempotency_key, account_id, amount_cents, currency)
    values (p_tenant_id, p_key, p_account_id, p_amount_cents, p_currency) returning id into v_order_id;
  v_response := jsonb_build_object('orderId', v_order_id, 'status', 'paid', 'amountCents', p_amount_cents, 'currency', p_currency);
  insert into public.payment_idempotency (tenant_id, key, request_body, response_body, status_code, order_id)
    values (p_tenant_id, p_key, v_request, v_response, 201, v_order_id);
  return jsonb_build_object('status_code', 201, 'body', v_response, 'replayed', false);
end;
$$;

revoke all on function public.create_payment(text, text, text, bigint, text) from public, anon, authenticated;
grant execute on function public.create_payment(text, text, text, bigint, text) to service_role;
commit;
