begin;

-- Professional starter accounts used by income and expense categories.
insert into public.accounts (account_code, account_name, account_type, status)
values
  ('4200', 'Other Operating Income', 'revenue', true),
  ('4210', 'Service Income', 'revenue', true),
  ('4220', 'Commission Income', 'revenue', true),
  ('4230', 'Delivery Income', 'revenue', true),
  ('6100', 'Rent Expense', 'expense', true),
  ('6110', 'Utilities Expense', 'expense', true),
  ('6120', 'Salaries and Wages', 'expense', true),
  ('6130', 'Transport and Delivery Expense', 'expense', true),
  ('6140', 'Repairs and Maintenance', 'expense', true),
  ('6150', 'Marketing and Advertising', 'expense', true),
  ('6160', 'Office and Store Supplies', 'expense', true),
  ('6170', 'Bank and Payment Charges', 'expense', true),
  ('6180', 'Miscellaneous Expense', 'expense', true)
on conflict (account_code) do update
set account_name = excluded.account_name,
    account_type = excluded.account_type;

insert into public.income_categories (name, account_id, status)
select seed.name, account.id, true
from (values
  ('Other Operating Income', '4200'),
  ('Service Income', '4210'),
  ('Commission Income', '4220'),
  ('Delivery Income', '4230')
) as seed(name, account_code)
join public.accounts account on account.account_code = seed.account_code
on conflict (name) do update
set account_id = excluded.account_id,
    status = true;

alter table public.expense_categories add column if not exists account_id bigint references public.accounts(id);

insert into public.expense_categories (name, description, status)
values
  ('Rent', 'Shop, warehouse, and office rent', true),
  ('Utilities', 'Electricity, gas, water, internet, and telephone', true),
  ('Salaries and Wages', 'Employee salaries, wages, and allowances', true),
  ('Transport and Delivery', 'Freight, courier, fuel, and local delivery costs', true),
  ('Repairs and Maintenance', 'Equipment, shop, and facility maintenance', true),
  ('Marketing and Advertising', 'Promotions, advertising, and printing', true),
  ('Office and Store Supplies', 'Consumables and day-to-day operating supplies', true),
  ('Bank and Payment Charges', 'Bank fees and payment processing charges', true),
  ('Miscellaneous', 'Other minor operating expenses', true)
on conflict (name) do update
set description = excluded.description,
    status = true;

update public.expense_categories category
set account_id = account.id
from (values
  ('Rent', '6100'), ('Utilities', '6110'), ('Salaries and Wages', '6120'),
  ('Transport and Delivery', '6130'), ('Repairs and Maintenance', '6140'),
  ('Marketing and Advertising', '6150'), ('Office and Store Supplies', '6160'),
  ('Bank and Payment Charges', '6170'), ('Miscellaneous', '6180')
) as seed(name, account_code)
join public.accounts account on account.account_code = seed.account_code
where category.name = seed.name;

create or replace function public.post_expense(p_category_id bigint, p_expense_date date, p_amount numeric, p_payment_method text, p_description text, p_receipt_url text)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_id bigint; v_expense_account bigint; v_payment_account bigint; v_no text;
begin
  if p_amount <= 0 then raise exception 'Expense amount must be positive'; end if;
  select account_id into v_expense_account from public.expense_categories where id = p_category_id and status = true;
  if v_expense_account is null then
    select id into v_expense_account from public.accounts where lower(account_type) in ('expense','operating_expense') and status = true order by id limit 1;
  end if;
  select id into v_payment_account from public.accounts where lower(account_type) = lower(p_payment_method) and status = true order by id limit 1;
  if v_expense_account is null or v_payment_account is null then raise exception 'Expense category or payment account is not configured'; end if;
  v_no := 'EXP-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');
  insert into public.expenses(expense_no,category_id,expense_date,amount,payment_method,description,receipt_url,created_by)
  values(v_no,p_category_id,coalesce(p_expense_date,current_date),p_amount,p_payment_method,p_description,p_receipt_url,auth.uid()) returning id into v_id;
  insert into public.ledger_entries(account_id,transaction_date,description,debit,credit,reference_type,reference_id) values
    (v_expense_account,coalesce(p_expense_date,current_date),v_no||' '||p_description,p_amount,0,'EXPENSE',v_id),
    (v_payment_account,coalesce(p_expense_date,current_date),v_no||' '||p_description,0,p_amount,'EXPENSE',v_id);
  return v_id;
end; $$;
grant execute on function public.post_expense(bigint,date,numeric,text,text,text) to authenticated;
notify pgrst, 'reload schema';
commit;
