begin;

alter table public.purchases add column if not exists warehouse_id bigint references public.warehouses(id), add column if not exists created_by uuid references auth.users(id);
alter table public.products add column if not exists name text, add column if not exists product_name text, add column if not exists cost_price numeric(18,2) default 0, add column if not exists purchase_price numeric(18,2) default 0, add column if not exists updated_at timestamptz default now();
update public.products set name=coalesce(nullif(name,''),product_name,'Product '||id),product_name=coalesce(nullif(product_name,''),name,'Product '||id),cost_price=coalesce(cost_price,purchase_price,0),purchase_price=coalesce(purchase_price,cost_price,0);
create or replace function public.sync_product_compatibility() returns trigger language plpgsql as $$begin new.product_name:=coalesce(nullif(new.product_name,''),new.name);new.name:=coalesce(nullif(new.name,''),new.product_name);new.purchase_price:=coalesce(new.purchase_price,new.cost_price,0);new.cost_price:=coalesce(new.cost_price,new.purchase_price,0);new.updated_at:=now();return new;end;$$;
drop trigger if exists products_sync_compatibility on public.products;create trigger products_sync_compatibility before insert or update on public.products for each row execute function public.sync_product_compatibility();

create or replace function public.post_transaction(debit_account bigint,credit_account bigint,amount numeric,description text,reference_type text default null,reference_id bigint default null)
returns void language plpgsql security definer set search_path=public as $$
begin
 if amount<=0 then raise exception 'Transaction amount must be positive';end if;
 if debit_account=credit_account then raise exception 'Debit and credit accounts must be different';end if;
 if not exists(select 1 from public.accounts where id=debit_account and status=true) or not exists(select 1 from public.accounts where id=credit_account and status=true) then raise exception 'A transaction account is invalid or inactive';end if;
 insert into public.ledger_entries(account_id,transaction_date,description,debit,credit,reference_type,reference_id) values(debit_account,current_date,description,amount,0,reference_type,reference_id),(credit_account,current_date,description,0,amount,reference_type,reference_id);
end;$$;
grant execute on function public.post_transaction(bigint,bigint,numeric,text,text,bigint) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists authenticated_product_images_read on storage.objects;create policy authenticated_product_images_read on storage.objects for select to authenticated using(bucket_id='product-images');
drop policy if exists authenticated_product_images_write on storage.objects;create policy authenticated_product_images_write on storage.objects for insert to authenticated with check(bucket_id='product-images');

commit;
