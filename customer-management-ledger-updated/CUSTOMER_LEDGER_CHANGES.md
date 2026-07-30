# Customer Management + Ledger — UI polish pass

This pass fixes broken/incomplete UI in the Customer Management and Ledger
screens only. No database/schema changes were made.

## Fixed
- **Ledger and View buttons did nothing.** `CustomerActions.jsx` had an Eye
  icon and a BookOpen icon with no `onClick`/`Link`. They now open a
  customer-details drawer and link to `/customers/:id/ledger`.
- **The ledger page was unreachable.** `CustomerLedger.jsx` existed but was
  never exported from `features/customers/index.js` and had no route in
  `AppRouter.jsx`. Both are now wired up.
- **`CustomerLedger.jsx` imported a hook that didn't exist**
  (`../hooks/useLedger`, no such file in `features/customers/hooks`). It now
  correctly imports `@/hooks/useLedger`.

## Rebuilt to match the existing design system
`LedgerHeader.jsx` and `LedgerFilters.jsx` were empty files. `LedgerSummary.jsx`
and `LedgerTable.jsx` were plain unstyled HTML tables with no loading/empty
states. All four were rebuilt using the app's existing shared components
(`DataTable`, `StatsCard`, `FilterBar`, `EmptyState`, `ExportButton`,
`PrintButton`, `Drawer`) so they look and behave like the rest of the app
(Customer List, etc.) instead of like an unfinished prototype.

New/restored functionality on the ledger page:
- Date-range and debit/credit filters
- "Walking" (running balance) vs "Simple" statement toggle, as originally
  requested
- CSV export and print, consistent with the customer list
- Loading skeletons and a proper empty state
- Running balance computed client-side from the customer's opening balance

Also gave `AddCustomer.jsx` / `EditCustomer.jsx` a consistent header, back
link, and loading skeleton to match.

## What's out of scope for this pass
- `database/*.sql` are still placeholder text files, not real SQL — the
  `ledger_entries` table these screens query doesn't exist in a real schema
  yet. The ledger page will work once that table (and `customers` fields
  like `opening_balance`, `current_balance`, `credit_limit`) exist in
  Supabase with matching column names.
- No other module (invoices, stock, purchases, accounts, reports) was
  touched.
