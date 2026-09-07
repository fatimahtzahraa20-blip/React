-- Run after schema.sql; safe to rerun. Allows only authenticated order managers.
begin;
grant insert (customer_id, description, amount, status) on public.orders to authenticated;
grant usage on sequence public.orders_id_seq to authenticated;
drop policy if exists "Order managers create orders" on public.orders;
create policy "Order managers create orders" on public.orders
  for insert to authenticated
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'order_manager'
    and amount between 0.01 and 1000000
    and length(trim(description)) between 1 and 120
    and status in ('Pending', 'Processing', 'Completed', 'Cancelled')
  );
commit;

-- One-time account setup:
-- Create your account under Authentication > Users > Add user in Supabase.
-- Then replace the email below and run these lines to grant that account the role:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--   || '{"role":"order_manager"}'::jsonb
-- where email = 'YOUR_ACCOUNT_EMAIL';
-- Sign out and sign in again after changing the role.
