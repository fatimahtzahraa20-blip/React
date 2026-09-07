-- Run once in the Supabase SQL Editor.
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (length(tenant_id) between 1 and 100),
  title text not null check (length(btrim(title)) between 1 and 200),
  body text not null default '' check (length(body) <= 100000),
  version integer not null default 1 check (version >= 1),
  last_edited_by text check (length(last_edited_by) <= 100),
  updated_at timestamptz not null default now()
);
create index documents_tenant_id_idx on public.documents (tenant_id);
alter table public.documents enable row level security;
revoke all on public.documents from anon, authenticated;
grant select, insert, update, delete on public.documents to service_role;

create or replace function public.update_document(
  p_tenant_id text, p_id uuid, p_expected_version integer, p_changes jsonb
) returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  current_doc public.documents;
begin
  if p_expected_version is null or p_expected_version < 1 or p_expected_version >= 2147483647 then
    raise exception 'Invalid version' using errcode = '22023';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'object' or p_changes = '{}'::jsonb then
    raise exception 'Changes must be a nonempty object' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_each(p_changes) as e
    where e.key not in ('title', 'body', 'editedBy') or jsonb_typeof(e.value) <> 'string') then
    raise exception 'Invalid changes' using errcode = '22023';
  end if;

  -- Compare and increment in the same SQL statement. PostgreSQL rechecks
  -- the predicate after a competing writer commits; only one writer wins.
  update public.documents
  set title = case when p_changes ? 'title' then p_changes->>'title' else title end,
      body = case when p_changes ? 'body' then p_changes->>'body' else body end,
      last_edited_by = case when p_changes ? 'editedBy' then p_changes->>'editedBy' else last_edited_by end,
      version = version + 1,
      updated_at = clock_timestamp()
  where id = p_id and tenant_id = p_tenant_id and version = p_expected_version
  returning * into current_doc;
  if found then
    return jsonb_build_object('status', 'updated', 'current', to_jsonb(current_doc));
  end if;

  select * into current_doc from public.documents
    where id = p_id and tenant_id = p_tenant_id;
  if not found then
    return jsonb_build_object('status', 'not_found', 'current', null);
  end if;
  return jsonb_build_object('status', 'conflict', 'current', to_jsonb(current_doc));
end;
$$;
revoke all on function public.update_document(text, uuid, integer, jsonb) from public, anon, authenticated;
grant execute on function public.update_document(text, uuid, integer, jsonb) to service_role;

