-- Paste directly into the Supabase SQL editor. Replace 'premium' with your search.
select o.id, o.description, o.amount, o.status, c.name as customer_name,
  c.email as customer_email
from public.orders o
inner join public.customers c on o.customer_id = c.id
where to_tsvector('english', o.id::text || ' ' || o.description || ' ' || c.name || ' ' || c.email)
  @@ websearch_to_tsquery('english', 'premium');

-- Alternatively, after schema.sql, use the same function as the app:
-- select * from public.search_orders('premium');
-- select * from public.search_orders(''); -- all orders
