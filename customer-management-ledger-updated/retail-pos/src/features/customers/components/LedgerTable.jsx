import { Link } from "react-router-dom";
import { DataTable, EmptyState, StatusBadge } from "@/components/shared";
const money = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-";
const columns = [
  { key: "transaction_date", header: "Date", render: (row) => date(row.transaction_date) },
  { key: "reference_type", header: "Type", render: (row) => <StatusBadge status={row.reference_type === "PAYMENT" ? "success" : "info"} label={row.reference_type === "PAYMENT" ? "Payment" : "Invoice"} /> },
  { key: "reference_no", header: "Reference", render: (row) => row.reference_type === "SALE" ? <Link to={`/sales/${row.source_id}`} className="font-semibold text-blue-600 hover:underline">{row.reference_no}</Link> : <span className="font-medium">{row.reference_no || "-"}</span> },
  { key: "description", header: "Description", render: (row) => <span className="text-slate-600 dark:text-slate-300">{row.description || "-"}</span> },
  { key: "debit", header: "Debit", headerClassName: "whitespace-nowrap px-4 py-3 text-right font-semibold", cellClassName: "whitespace-nowrap px-4 py-3 text-right", render: (row) => Number(row.debit) ? <span className="font-semibold text-red-600">{money(row.debit)}</span> : "-" },
  { key: "credit", header: "Credit", headerClassName: "whitespace-nowrap px-4 py-3 text-right font-semibold", cellClassName: "whitespace-nowrap px-4 py-3 text-right", render: (row) => Number(row.credit) ? <span className="font-semibold text-emerald-600">{money(row.credit)}</span> : "-" },
  { key: "balance", header: "Balance", headerClassName: "whitespace-nowrap px-4 py-3 text-right font-semibold", cellClassName: "whitespace-nowrap px-4 py-3 text-right font-bold", render: (row) => money(row.balance) },
];
export default function LedgerTable({ ledger = [], loading, mode = "detailed" }) {
  const visible = mode === "compact" ? columns.filter((column) => !["reference_type", "description"].includes(column.key)) : columns;
  return <DataTable columns={visible} data={ledger} isLoading={loading} emptyState={<EmptyState title="No customer transactions" description="Sales invoices and received payments for this customer will appear here automatically." />} />;
}
