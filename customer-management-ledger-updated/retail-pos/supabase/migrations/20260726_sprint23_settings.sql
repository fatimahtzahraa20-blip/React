begin;

create table if not exists public.app_settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null default 'Retail POS',
  legal_name text,
  tax_number text,
  phone text,
  email text,
  website text,
  address text,
  city text,
  country text,
  logo_url text,
  currency_code text not null default 'PKR',
  currency_symbol text not null default 'Rs',
  currency_position text not null default 'before'
    check (currency_position in ('before', 'after')),
  decimal_places smallint not null default 2
    check (decimal_places between 0 and 4),
  tax_enabled boolean not null default false,
  tax_name text not null default 'Tax',
  tax_rate numeric(7,4) not null default 0
    check (tax_rate between 0 and 100),
  prices_include_tax boolean not null default false,
  invoice_prefix text not null default 'INV',
  invoice_footer text,
  invoice_terms text,
  show_logo_on_invoice boolean not null default true,
  receipt_header text,
  receipt_footer text,
  receipt_paper_size text not null default '80mm'
    check (receipt_paper_size in ('58mm', '80mm', 'a4')),
  email_from_name text,
  email_from_address text,
  email_reply_to text,
  backup_enabled boolean not null default false,
  backup_frequency text not null default 'weekly'
    check (backup_frequency in ('daily', 'weekly', 'monthly')),
  backup_retention_days integer not null default 30
    check (backup_retention_days between 1 and 3650),
  default_theme text not null default 'system'
    check (default_theme in ('light', 'dark', 'system')),
  compact_mode boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id)
values (1)
on conflict (id) do nothing;

create or replace function public.touch_app_settings()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists app_settings_touch_updated_at on public.app_settings;
create trigger app_settings_touch_updated_at
before update on public.app_settings
for each row execute function public.touch_app_settings();

create or replace function public.update_app_settings(p_settings jsonb)
returns public.app_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.app_settings;
begin
  if not public.has_permission('settings.manage') then
    raise exception 'Forbidden';
  end if;

  update public.app_settings
  set
    company_name = coalesce(p_settings->>'company_name', company_name),
    legal_name = case when p_settings ? 'legal_name' then nullif(p_settings->>'legal_name', '') else legal_name end,
    tax_number = case when p_settings ? 'tax_number' then nullif(p_settings->>'tax_number', '') else tax_number end,
    phone = case when p_settings ? 'phone' then nullif(p_settings->>'phone', '') else phone end,
    email = case when p_settings ? 'email' then nullif(p_settings->>'email', '') else email end,
    website = case when p_settings ? 'website' then nullif(p_settings->>'website', '') else website end,
    address = case when p_settings ? 'address' then nullif(p_settings->>'address', '') else address end,
    city = case when p_settings ? 'city' then nullif(p_settings->>'city', '') else city end,
    country = case when p_settings ? 'country' then nullif(p_settings->>'country', '') else country end,
    logo_url = case when p_settings ? 'logo_url' then nullif(p_settings->>'logo_url', '') else logo_url end,
    currency_code = coalesce(p_settings->>'currency_code', currency_code),
    currency_symbol = coalesce(p_settings->>'currency_symbol', currency_symbol),
    currency_position = coalesce(p_settings->>'currency_position', currency_position),
    decimal_places = coalesce((p_settings->>'decimal_places')::smallint, decimal_places),
    tax_enabled = coalesce((p_settings->>'tax_enabled')::boolean, tax_enabled),
    tax_name = coalesce(p_settings->>'tax_name', tax_name),
    tax_rate = coalesce((p_settings->>'tax_rate')::numeric, tax_rate),
    prices_include_tax = coalesce((p_settings->>'prices_include_tax')::boolean, prices_include_tax),
    invoice_prefix = coalesce(p_settings->>'invoice_prefix', invoice_prefix),
    invoice_footer = case when p_settings ? 'invoice_footer' then nullif(p_settings->>'invoice_footer', '') else invoice_footer end,
    invoice_terms = case when p_settings ? 'invoice_terms' then nullif(p_settings->>'invoice_terms', '') else invoice_terms end,
    show_logo_on_invoice = coalesce((p_settings->>'show_logo_on_invoice')::boolean, show_logo_on_invoice),
    receipt_header = case when p_settings ? 'receipt_header' then nullif(p_settings->>'receipt_header', '') else receipt_header end,
    receipt_footer = case when p_settings ? 'receipt_footer' then nullif(p_settings->>'receipt_footer', '') else receipt_footer end,
    receipt_paper_size = coalesce(p_settings->>'receipt_paper_size', receipt_paper_size),
    email_from_name = case when p_settings ? 'email_from_name' then nullif(p_settings->>'email_from_name', '') else email_from_name end,
    email_from_address = case when p_settings ? 'email_from_address' then nullif(p_settings->>'email_from_address', '') else email_from_address end,
    email_reply_to = case when p_settings ? 'email_reply_to' then nullif(p_settings->>'email_reply_to', '') else email_reply_to end,
    backup_enabled = coalesce((p_settings->>'backup_enabled')::boolean, backup_enabled),
    backup_frequency = coalesce(p_settings->>'backup_frequency', backup_frequency),
    backup_retention_days = coalesce((p_settings->>'backup_retention_days')::integer, backup_retention_days),
    default_theme = coalesce(p_settings->>'default_theme', default_theme),
    compact_mode = coalesce((p_settings->>'compact_mode')::boolean, compact_mode),
    updated_by = auth.uid()
  where id = 1
  returning * into result;

  insert into public.activity_logs (
    user_id, action, module, entity_type, entity_id, metadata
  ) values (
    auth.uid(), 'settings_updated', 'settings', 'app_settings', '1',
    jsonb_build_object('fields', (select jsonb_agg(key) from jsonb_each(p_settings)))
  );

  return result;
end;
$$;

insert into public.permissions (name, code, module)
values ('Manage Settings', 'settings.manage', 'settings')
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.slug = 'admin' and p.code = 'settings.manage'
on conflict do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-assets',
  'company-assets',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.app_settings enable row level security;

drop policy if exists "authenticated_read_app_settings" on public.app_settings;
create policy "authenticated_read_app_settings"
on public.app_settings for select
to authenticated
using (true);

drop policy if exists "authenticated_read_company_assets" on storage.objects;
create policy "authenticated_read_company_assets"
on storage.objects for select
to authenticated
using (bucket_id = 'company-assets');

drop policy if exists "settings_manage_company_assets_insert" on storage.objects;
create policy "settings_manage_company_assets_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'company-assets'
  and public.has_permission('settings.manage')
);

drop policy if exists "settings_manage_company_assets_update" on storage.objects;
create policy "settings_manage_company_assets_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'company-assets'
  and public.has_permission('settings.manage')
)
with check (
  bucket_id = 'company-assets'
  and public.has_permission('settings.manage')
);

drop policy if exists "settings_manage_company_assets_delete" on storage.objects;
create policy "settings_manage_company_assets_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'company-assets'
  and public.has_permission('settings.manage')
);

grant select on public.app_settings to authenticated;
grant execute on function public.update_app_settings(jsonb) to authenticated;

commit;
