begin;
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 200)
);
create table public.tenant_memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (tenant_id, user_id)
);
create index tenant_memberships_user_idx on public.tenant_memberships(user_id, tenant_id);
create table public.items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null check (name = btrim(name) and length(name) between 1 and 200),
  sku text not null check (sku = btrim(sku) and length(sku) between 1 and 100),
  created_at timestamptz not null default now(),
  unique (tenant_id, sku)
);
create index items_tenant_id_idx on public.items(tenant_id, id);
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.items enable row level security;
revoke all on public.tenants, public.tenant_memberships, public.items from anon, authenticated;
grant select on public.tenants, public.tenant_memberships, public.items to authenticated;
grant insert (tenant_id, name, sku), update (name, sku) on public.items to authenticated;
grant delete on public.items to authenticated;
create policy own_memberships on public.tenant_memberships for select to authenticated
  using (user_id = (select auth.uid()));
create policy member_tenants on public.tenants for select to authenticated
  using (id in (select tenant_id from public.tenant_memberships where user_id = (select auth.uid())));
create policy member_items_select on public.items for select to authenticated
  using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = (select auth.uid())));
create policy member_items_insert on public.items for insert to authenticated
  with check (tenant_id in (select tenant_id from public.tenant_memberships where user_id = (select auth.uid())));
create policy member_items_update on public.items for update to authenticated
  using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = (select auth.uid())))
  with check (tenant_id in (select tenant_id from public.tenant_memberships where user_id = (select auth.uid())));
create policy member_items_delete on public.items for delete to authenticated
  using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = (select auth.uid())));
commit;
