-- Apply once in the Supabase SQL Editor (or with the Supabase CLI).
begin;
create table public.items (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (length(btrim(tenant_id)) between 1 and 100),
  name text not null check (name = btrim(name) and length(name) between 1 and 200),
  sku text not null check (sku = btrim(sku) and length(sku) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by text check (length(deleted_by) <= 100),
  constraint deletion_metadata check (deleted_at is not null or deleted_by is null)
);
-- SKU comparison is case-sensitive; reuse is allowed only after soft deletion.
create unique index items_live_tenant_sku on public.items (tenant_id, sku) where deleted_at is null;
create index items_live_listing on public.items (tenant_id, created_at desc, id) where deleted_at is null;
create index items_trash_listing on public.items (tenant_id, created_at desc, id) where deleted_at is not null;
create index items_all_listing on public.items (tenant_id, created_at desc, id);

create function public.set_item_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger items_updated_at before update on public.items
for each row execute function public.set_item_updated_at();

-- Single conditional UPDATE locks the affected row; no read/write race.
create function public.soft_delete_item(p_tenant_id text, p_id uuid, p_actor text default null)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  result jsonb;
  tenant_key public.items.tenant_id%type := p_tenant_id;
begin
  update public.items set deleted_at = clock_timestamp(), deleted_by = p_actor
  where tenant_id = tenant_key and id = p_id and deleted_at is null
  returning to_jsonb(items.*) into result;
  return result;
end;
$$;
create function public.restore_item(p_tenant_id text, p_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  result jsonb;
  tenant_key public.items.tenant_id%type := p_tenant_id;
begin
  -- The unique index checks competing inserts/restores atomically.
  -- On SQLSTATE 23505 the statement rolls back, retaining the tombstone.
  update public.items set deleted_at = null, deleted_by = null
  where tenant_id = tenant_key and id = p_id and deleted_at is not null
  returning to_jsonb(items.*) into result;
  return result;
end;
$$;

-- Server-only API: no browser access, and no public hard-delete operation.
alter table public.items enable row level security;
revoke all on public.items from anon, authenticated;
grant select, insert, update on public.items to service_role;
revoke delete, truncate on public.items from service_role;
revoke all on function public.soft_delete_item(text, uuid, text) from public, anon, authenticated;
revoke all on function public.restore_item(text, uuid) from public, anon, authenticated;
revoke all on function public.set_item_updated_at() from public, anon, authenticated;
grant execute on function public.soft_delete_item(text, uuid, text) to service_role;
grant execute on function public.restore_item(text, uuid) to service_role;
commit;
