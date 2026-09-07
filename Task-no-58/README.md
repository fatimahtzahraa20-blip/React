# place-order

Task 68: Supabase Advanced SQL - React application

place-order demonstrates the task requirement: use a SQL JOIN to fetch Orders with Customers and add a full-text search bar. It uses React and Supabase to display related records in an order-management dashboard.

## Task implementation

- Join `public.orders` and `public.customers` through `orders.customer_id = customers.id`.
- Display order IDs, customer names and emails, descriptions, dates, amounts, and statuses.
- Search across order IDs, descriptions, customer names, and emails using PostgreSQL full-text search.
- Call the `search_orders` database function from React through Supabase RPC.

The project follows the concepts in Supabase's official [JOIN documentation](https://supabase.com/docs/guides/database/joins-and-nesting) and [full-text search documentation](https://supabase.com/docs/guides/database/full-text-search).

## Features

- Responsive order dashboard and customer directory.
- Search with a 250 ms debounce, status tabs, date filters, and amount sorting.
- Pagination, row selection, order details, and CSV export.
- SQL preview with a copy button.
- Order creation for existing customers, with validation and save error messages.
- Supabase email/password sign-in for authorized order managers.
- Local demo mode with 48 sample orders and 12 customers.

## Technology

React, Vite, JavaScript, CSS, Lucide React icons, Supabase JavaScript client, PostgreSQL, and Supabase Auth.

## Run locally

Install Node.js and npm, then run these commands from the project folder:

```sh
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

```sh
npm run build    # Generate the production app in dist/
npm run preview  # Preview the production build locally
```

Without Supabase environment variables, the app runs in demo mode. Demo orders are stored in memory and reset when the page reloads. Demo search uses local word matching; PostgreSQL full-text search runs when Supabase is configured.

## Connect Supabase

1. Create a Supabase project.
2. Open its SQL editor and run [supabase/schema.sql](supabase/schema.sql) once in a fresh database. It creates the tables, relationship, search function, read policies, and sample records. Do not rerun this seed script if the tables already exist.
3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

4. Restart the Vite server after changing `.env`.

Use the project's public anon or publishable key. Keep `.env` out of version control and never place a service-role key in frontend code.

## Database structure

| Table | Main columns | Purpose |
| --- | --- | --- |
| `customers` | `id`, `name`, `email` | Customer records |
| `orders` | `id`, `customer_id`, `description`, `amount`, `status`, `created_at` | Orders linked to customers |

Each order belongs to one customer through a foreign key. Valid statuses are `Pending`, `Processing`, `Completed`, and `Cancelled`.

## JOIN and full-text search

The search function uses an `INNER JOIN` and combines fields into a PostgreSQL search vector. This example runs directly in the Supabase SQL editor:

```sql
select
  o.id,
  o.description,
  o.amount,
  o.status,
  c.name as customer_name,
  c.email as customer_email
from public.orders o
inner join public.customers c on o.customer_id = c.id
where to_tsvector(
  'english',
  o.id::text || ' ' || o.description || ' ' || c.name || ' ' || c.email
) @@ websearch_to_tsquery('english', 'premium');
```

Replace `'premium'` with the desired search text. A runnable copy is available in [supabase/search-example.sql](supabase/search-example.sql).

React passes search input as an RPC parameter:

```js
const { data, error } = await supabase.rpc('search_orders', {
  search_query: query,
});
```

You can also test the function in the SQL editor:

```sql
select * from public.search_orders('premium');
select * from public.search_orders(''); -- Return all visible orders.
```

Use a quoted string in standalone SQL. `:query` is not a valid standalone PostgreSQL parameter; the SQL editor's default 100-row limit does not cause that syntax error.

## Create orders

### Local demo

Click **Create order**, choose a customer, enter a description and amount, select a status, and submit. The order appears in the table until the page reloads.

### Connected Supabase database

Complete this setup once:

1. Run [supabase/enable-order-creation.sql](supabase/enable-order-creation.sql) after the schema. This script can be rerun safely.
2. Create an email/password account under **Authentication > Users > Add user** in Supabase.
3. In the SQL editor, grant that account the order-manager role by replacing the example email below:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"order_manager"}'::jsonb
where email = 'YOUR_ACCOUNT_EMAIL';
```

4. Click **Create order** in the app and sign in. If already signed in when the role changed, sign out and sign in again.
5. Select a database customer, enter the order details, and submit. The app saves the order to Supabase and refreshes the table.

The form accepts amounts from $0.01 to $1,000,000 and descriptions up to 120 characters. Customers are loaded independently of the current order search. To add a new customer, insert a record into the `customers` table in Supabase and reopen the form.

Row Level Security permits inserts only for authenticated users whose administrator-controlled app metadata contains `role: order_manager`. Anonymous users cannot create orders.

## Project files

```text
src/
  main.jsx                    Dashboard, search, filters, and navigation
  CreateOrder.jsx             Sign-in and order creation form
  styles.css                  Responsive app styles
supabase/
  schema.sql                  Tables, sample records, JOIN search function
  enable-order-creation.sql   Authorized order insertion policy
  search-example.sql          Runnable full-text search example
index.html                    HTML entry point
package.json                  Dependencies and scripts
```

## Implementation notes

- The schema's public read policies are for sample data. Private customer data requires appropriately scoped read policies.
- Search results are fetched when the query changes and after order creation; the app does not subscribe to realtime database updates.
- Dashboard totals reflect the currently loaded dataset. Trend percentages and sparklines are illustrative sample values.
- Pagination and filters run in the browser. The combined search vector is computed at query time; larger datasets would benefit from server-side pagination and an indexed search representation.
- A successful production build verifies compilation. Live search and order creation also require the SQL scripts, environment variables, and account setup above.
