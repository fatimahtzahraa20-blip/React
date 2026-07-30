# Supabase database setup

This folder now contains the complete database contract used by the Retail POS frontend.

## Fresh project

Apply every file in `migrations/` in filename order. The first migration, `20260725_00_base_schema.sql`, creates the foundational master, inventory, sales, accounting, and purchase tables required by later sprint migrations.

With Supabase CLI after linking the project:

```powershell
supabase db push
```

Without the CLI, open the Supabase SQL Editor and run the migration files in filename order.

## Existing project

Apply any migration not previously run, especially:

- `20260730_income_management.sql`
- `20260730_purchase_management.sql`
- `20260730_user_management.sql`
- `20260730_zz_schema_completeness.sql`

Do not rerun old migrations manually when they are already recorded by Supabase CLI.

## Verification

After all migrations are applied, run `verify_schema.sql` in the SQL Editor. A complete installation returns zero rows from both result sets. It checks every frontend table, RPC function, and storage bucket.

## Coverage

The migrations include:

- Customer, supplier, catalog, product, and unit masters
- Warehouses, stock, adjustments, and stock movements
- POS invoices, held sales, cancellations, and sales returns
- Purchases, purchase items, and purchase returns
- Accounts, journals, ledgers, payments, income, and expenses
- Roles, permissions, user profiles, and activity logs
- Notifications, search filters, global search, and settings
- Product images, expense receipts, and company asset buckets
- RLS policies, authenticated grants, triggers, indexes, seed roles, permissions, and chart of accounts
