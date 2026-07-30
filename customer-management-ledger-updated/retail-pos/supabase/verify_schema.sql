-- Run after migrations to verify every Supabase dependency used by the frontend.
with required(name) as (values
 ('accounts'),('activity_logs'),('app_settings'),('brands'),('categories'),('customers'),('expense_categories'),('expenses'),
 ('held_sales'),('income_categories'),('incomes'),('invoice_items'),('invoices'),('ledger_entries'),('notifications'),('payments'),
 ('permissions'),('products'),('profiles'),('purchase_items'),('purchase_return_items'),('purchase_returns'),('purchases'),
 ('role_permissions'),('roles'),('sales_return_items'),('sales_returns'),('saved_filters'),('stock'),('stock_movements'),
 ('suppliers'),('units'),('warehouses')
)
select 'missing_table' as issue,r.name from required r left join information_schema.tables t on t.table_schema='public' and t.table_name=r.name where t.table_name is null
union all
select 'missing_bucket',r.name from (values('company-assets'),('expense-receipts'),('product-images')) r(name) left join storage.buckets b on b.id=r.name where b.id is null;

with required(name) as (values
 ('adjust_stock'),('assign_user_role'),('cancel_sale'),('create_role'),('get_my_access'),('get_my_notifications'),('global_search'),
 ('mark_all_notifications_read'),('mark_notification_read'),('post_expense'),('post_income'),('post_manual_journal'),
 ('post_party_payment'),('post_purchase'),('post_purchase_return'),('post_sale'),('post_transaction'),('refresh_system_alerts'),
 ('return_sale'),('reverse_expense'),('reverse_income'),('save_user_filter'),('set_account_opening_balance'),('set_opening_stock'),
 ('set_role_permissions'),('set_user_status'),('update_app_settings')
)
select 'missing_function' as issue,r.name from required r where not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=r.name);
