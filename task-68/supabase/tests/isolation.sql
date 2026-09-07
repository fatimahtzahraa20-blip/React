-- Run as an administrator in the Supabase SQL Editor after the migration.
-- All fixtures and writes are rolled back. Any unexpected access raises an error.
begin;
insert into auth.users (id) values
 ('78000000-0000-4000-8000-000000000001'),
 ('78000000-0000-4000-8000-000000000002');
insert into public.tenants (id, name) values
 ('78000000-0000-4000-8000-00000000000a', 'Isolation test A'),
 ('78000000-0000-4000-8000-00000000000b', 'Isolation test B');
insert into public.tenant_memberships values
 ('78000000-0000-4000-8000-00000000000a', '78000000-0000-4000-8000-000000000001'),
 ('78000000-0000-4000-8000-00000000000b', '78000000-0000-4000-8000-000000000002');
insert into public.items (id, tenant_id, name, sku) values
 ('78000000-0000-4000-8000-000000000011', '78000000-0000-4000-8000-00000000000a', 'A', 'same'),
 ('78000000-0000-4000-8000-000000000012', '78000000-0000-4000-8000-00000000000b', 'B', 'same');
set local role authenticated;
select set_config('request.jwt.claim.sub', '78000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"78000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$
declare affected integer;
begin
 if (select count(*) from public.items) <> 1 then raise exception 'Unscoped read leaked data'; end if;
 if (select count(*) from public.tenants) <> 1 then raise exception 'Tenant read leaked data'; end if;
 if (select count(*) from public.tenant_memberships) <> 1 then raise exception 'Membership read leaked data'; end if;
 update public.items set name = 'forged' where id = '78000000-0000-4000-8000-000000000012';
 get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'Cross-tenant update succeeded'; end if;
 delete from public.items where id = '78000000-0000-4000-8000-000000000012';
 get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'Cross-tenant delete succeeded'; end if;
 begin
  insert into public.items (tenant_id, name, sku) values ('78000000-0000-4000-8000-00000000000b', 'forged', 'forged');
  raise exception 'Cross-tenant insert succeeded';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.tenant_memberships values ('78000000-0000-4000-8000-00000000000b', '78000000-0000-4000-8000-000000000001');
  raise exception 'Self enrollment succeeded';
 exception when insufficient_privilege then null; end;
 begin
  update public.items set tenant_id = '78000000-0000-4000-8000-00000000000b'
   where id = '78000000-0000-4000-8000-000000000011';
  raise exception 'Tenant reassignment succeeded';
 exception when insufficient_privilege then null; end;
 insert into public.items (tenant_id, name, sku) values ('78000000-0000-4000-8000-00000000000a', 'Allowed', 'new');
 update public.items set name = 'Allowed update' where sku = 'new';
 get diagnostics affected = row_count;
 if affected <> 1 then raise exception 'Own update failed'; end if;
 delete from public.items where sku = 'new';
 get diagnostics affected = row_count;
 if affected <> 1 then raise exception 'Own delete failed'; end if;
 begin
  insert into public.items (tenant_id, name, sku) values ('78000000-0000-4000-8000-00000000000a', 'Duplicate', 'same');
  raise exception 'Duplicate SKU succeeded';
 exception when unique_violation then null; end;
end $$;
reset role;
delete from public.tenant_memberships where user_id = '78000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$ begin
 if exists (select from public.items) then raise exception 'Revocation did not take effect'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
 begin
  perform * from public.items;
  raise exception 'Anonymous access succeeded';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
