begin;

create or replace function public.post_sale(
  p_customer_id bigint,
  p_warehouse_id bigint,
  p_items jsonb,
  p_discount numeric,
  p_tax numeric,
  p_paid_amount numeric,
  p_payment_method text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice_id bigint;
  v_invoice_no text;
  v_subtotal numeric := 0;
  v_grand_total numeric;
  v_due numeric;
  v_cogs numeric := 0;
  v_item jsonb;
  v_stock public.stock;
  v_product public.products;
  v_cash_account bigint;
  v_ar_account bigint;
  v_sales_account bigint;
  v_inventory_account bigint;
  v_cogs_account bigint;
begin
  if jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  if p_discount < 0 or p_tax < 0 or p_paid_amount < 0 then raise exception 'Amounts cannot be negative'; end if;
  if lower(coalesce(p_payment_method, '')) not in ('cash', 'card', 'credit') then raise exception 'Invalid payment method'; end if;
  if p_warehouse_id is null then raise exception 'Warehouse is required'; end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id = (v_item->>'product_id')::bigint;
    if v_product.id is null then raise exception 'Product not found'; end if;
    if coalesce((v_item->>'quantity')::numeric, 0) <= 0 then raise exception 'Product quantity must be greater than zero'; end if;
    if coalesce(v_product.sale_price, 0) < 0 then raise exception 'Product sale price is invalid'; end if;
    v_subtotal := v_subtotal + ((v_item->>'quantity')::numeric * coalesce(v_product.sale_price, 0));
    v_cogs := v_cogs + ((v_item->>'quantity')::numeric * coalesce(v_product.purchase_price, 0));
  end loop;

  if p_discount > v_subtotal + p_tax then raise exception 'Discount exceeds sale amount'; end if;
  v_grand_total := v_subtotal - p_discount + p_tax;
  if v_grand_total <= 0 then raise exception 'Sale total must be greater than zero'; end if;
  if p_paid_amount > v_grand_total then raise exception 'Paid amount exceeds total'; end if;
  v_due := v_grand_total - p_paid_amount;
  if v_due > 0 and p_customer_id is null then raise exception 'Customer is required for credit sale'; end if;

  select id into v_cash_account from public.accounts
  where lower(account_type) = case when lower(p_payment_method) = 'card' then 'bank' else 'cash' end
    and status = true order by id limit 1;
  select id into v_ar_account from public.accounts where lower(account_type) in ('accounts_receivable','receivable') and status = true order by id limit 1;
  select id into v_sales_account from public.accounts where lower(account_type) in ('sales','revenue') and status = true order by id limit 1;
  select id into v_inventory_account from public.accounts where lower(account_type) in ('inventory','stock') and status = true order by id limit 1;
  select id into v_cogs_account from public.accounts where lower(account_type) in ('cost_of_goods_sold','cogs') and status = true order by id limit 1;
  if v_sales_account is null or v_inventory_account is null or v_cogs_account is null or (p_paid_amount > 0 and v_cash_account is null) or (v_due > 0 and v_ar_account is null) then
    raise exception 'Required POS ledger accounts are not configured';
  end if;

  v_invoice_no := 'INV-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');
  insert into public.invoices (invoice_no, customer_id, invoice_date, subtotal, discount, tax, grand_total, paid_amount, due_amount, payment_method)
  values (v_invoice_no, p_customer_id, current_date, v_subtotal, p_discount, p_tax, v_grand_total, p_paid_amount, v_due, p_payment_method)
  returning id into v_invoice_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id = (v_item->>'product_id')::bigint;
    select * into v_stock from public.stock
    where product_id = (v_item->>'product_id')::bigint and warehouse_id = p_warehouse_id for update;
    if v_stock.id is null or v_stock.quantity < (v_item->>'quantity')::numeric then
      raise exception 'Insufficient stock for product %', v_item->>'product_id';
    end if;
    update public.stock set quantity = quantity - (v_item->>'quantity')::numeric where id = v_stock.id returning * into v_stock;
    insert into public.invoice_items (invoice_id, product_id, quantity, sale_price, discount, total)
    values (v_invoice_id, (v_item->>'product_id')::bigint, (v_item->>'quantity')::numeric, v_product.sale_price, 0, (v_item->>'quantity')::numeric * v_product.sale_price);
    insert into public.stock_movements(product_id, warehouse_id, movement_type, quantity, balance_after, reference_type, reference_id, notes, created_by)
    values ((v_item->>'product_id')::bigint, p_warehouse_id, 'sale', -(v_item->>'quantity')::numeric, v_stock.quantity, 'invoice', v_invoice_id, v_invoice_no, auth.uid());
  end loop;

  if p_paid_amount > 0 then
    insert into public.ledger_entries(account_id, transaction_date, description, debit, credit, reference_type, reference_id)
    values (v_cash_account, current_date, v_invoice_no, p_paid_amount, 0, 'SALE', v_invoice_id);
  end if;
  if v_due > 0 then
    insert into public.ledger_entries(account_id, transaction_date, description, debit, credit, reference_type, reference_id)
    values (v_ar_account, current_date, v_invoice_no, v_due, 0, 'SALE', v_invoice_id);
    update public.customers set current_balance = coalesce(current_balance,0) + v_due where id = p_customer_id;
  end if;
  insert into public.ledger_entries(account_id, transaction_date, description, debit, credit, reference_type, reference_id)
  values
    (v_sales_account, current_date, v_invoice_no, 0, v_grand_total, 'SALE', v_invoice_id),
    (v_cogs_account, current_date, v_invoice_no || ' COGS', v_cogs, 0, 'SALE', v_invoice_id),
    (v_inventory_account, current_date, v_invoice_no || ' Inventory', 0, v_cogs, 'SALE', v_invoice_id);

  return v_invoice_id;
end;
$$;

revoke all on function public.post_sale(bigint,bigint,jsonb,numeric,numeric,numeric,text) from public;
grant execute on function public.post_sale(bigint,bigint,jsonb,numeric,numeric,numeric,text) to authenticated;

commit;
