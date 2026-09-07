-- Compatibility fix for the existing UUID tenant schema.
-- Create the live-only index before removing the legacy full-table constraint.
begin;
create unique index if not exists items_live_tenant_sku
  on public.items (tenant_id, sku) where deleted_at is null;
alter table public.items drop constraint if exists items_tenant_id_sku_key;
create or replace function public.set_item_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
drop trigger if exists items_updated_at on public.items;
create trigger items_updated_at before update on public.items
for each row execute function public.set_item_updated_at();

-- Single conditional UPDATE locks the affected row; no read/write race.
create or replace function public.soft_delete_item(p_tenant_id text, p_id uuid, p_actor text default null)
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
create or replace function public.restore_item(p_tenant_id text, p_id uuid)
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
notify pgrst, 'reload schema';
commit;
