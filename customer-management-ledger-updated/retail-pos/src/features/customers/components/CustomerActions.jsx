import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, BookOpen } from "lucide-react";

import { Drawer, StatusBadge } from "@/components/shared";
import DeleteCustomerDialog from "./DeleteCustomerDialog";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0 dark:border-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-100">{value || "—"}</span>
    </div>
  );
}

export default function CustomerActions({ customer }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="flex justify-center gap-1">
      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label={`View ${customer.name}`}
        title="View details"
      >
        <Eye size={18} />
      </button>

      <Link
        to={`/customers/${customer.id}/edit`}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label={`Edit ${customer.name}`}
        title="Edit customer"
      >
        <Pencil size={18} />
      </Link>

      <Link
        to={`/customers/${customer.id}/ledger`}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label={`View ledger for ${customer.name}`}
        title="View ledger"
      >
        <BookOpen size={18} />
      </Link>

      <DeleteCustomerDialog customer={customer} />

      <Drawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={customer.name}
        footer={(
          <div className="flex justify-end gap-3">
            <Link
              to={`/customers/${customer.id}/ledger`}
              onClick={() => setDetailsOpen(false)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <BookOpen className="size-4" /> View ledger
            </Link>
            <Link
              to={`/customers/${customer.id}/edit`}
              onClick={() => setDetailsOpen(false)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Pencil className="size-4" /> Edit
            </Link>
          </div>
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">{customer.customer_code || "—"}</span>
            <StatusBadge status={customer.status} />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-3 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Current balance</p>
                <p className="mt-1 text-lg font-bold">{formatCurrency(customer.current_balance)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Credit limit</p>
                <p className="mt-1 text-lg font-bold">{formatCurrency(customer.credit_limit)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 px-4 dark:border-slate-800">
            <DetailRow label="Phone" value={customer.phone} />
            <DetailRow label="Email" value={customer.email} />
            <DetailRow label="Address" value={customer.address} />
            <DetailRow label="Opening balance" value={formatCurrency(customer.opening_balance)} />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
