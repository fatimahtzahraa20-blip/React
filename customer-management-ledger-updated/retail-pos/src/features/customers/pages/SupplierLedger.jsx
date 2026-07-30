import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertCircle, ArrowDownCircle, ArrowLeft, ArrowUpCircle, Scale, WalletCards } from "lucide-react";
import { DataTable, EmptyState, ExportButton, PageHeader, PrintButton, StatsCard, StatusBadge } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import useSupplierLedger from "@/hooks/useSupplierLedger";
import exportToCsv from "@/utils/exportToCsv";
import printContent from "@/utils/printContent";
import LedgerFilters from "../components/LedgerFilters";
import PaySupplierDialog from "../components/PaySupplierDialog";

const EMPTY = { from: "", to: "", type: "" };
const money = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-";

export default function SupplierLedger() {
  const { id } = useParams();
  const [filters, setFilters] = useState(EMPTY);
  const query = useSupplierLedger(id);
  const supplier = query.data?.supplier;
  const raw = query.data?.ledger || [];
  const complete = useMemo(() => { let balance = Number(supplier?.opening_balance || 0); return raw.map((row) => { balance += Number(row.credit || 0) - Number(row.debit || 0); return { ...row, running_balance: balance }; }); }, [raw, supplier?.opening_balance]);
  const rows = useMemo(() => complete.filter((row) => { if (filters.from && row.transaction_date < filters.from) return false; if (filters.to && row.transaction_date > filters.to) return false; if (filters.type === "debit" && !Number(row.debit)) return false; if (filters.type === "credit" && !Number(row.credit)) return false; return true; }), [complete, filters]);
  const periodOpening = useMemo(() => { if (!filters.from) return Number(supplier?.opening_balance || 0); return complete.filter((row) => row.transaction_date < filters.from).at(-1)?.running_balance ?? Number(supplier?.opening_balance || 0); }, [complete, filters.from, supplier?.opening_balance]);
  const debit = rows.reduce((sum, row) => sum + Number(row.debit || 0), 0);
  const credit = rows.reduce((sum, row) => sum + Number(row.credit || 0), 0);
  const closing = rows.at(-1)?.running_balance ?? periodOpening;
  const columns = [
    { key: "transaction_date", header: "Date", render: (row) => date(row.transaction_date) },
    { key: "reference_type", header: "Type", render: (row) => <StatusBadge status={row.reference_type === "PAYMENT" ? "success" : "info"} label={row.reference_type === "PAYMENT" ? "Payment" : "Purchase"} /> },
    { key: "reference_no", header: "Reference", render: (row) => <span className="font-semibold text-blue-600">{row.reference_no || "-"}</span> },
    { key: "description", header: "Description" },
    { key: "credit", header: "Purchase / Credit", headerClassName: "px-4 py-3 text-right font-semibold", cellClassName: "px-4 py-3 text-right", render: (row) => Number(row.credit) ? <span className="font-semibold text-red-600">{money(row.credit)}</span> : "-" },
    { key: "debit", header: "Payment / Debit", headerClassName: "px-4 py-3 text-right font-semibold", cellClassName: "px-4 py-3 text-right", render: (row) => Number(row.debit) ? <span className="font-semibold text-emerald-600">{money(row.debit)}</span> : "-" },
    { key: "running_balance", header: "Balance", headerClassName: "px-4 py-3 text-right font-semibold", cellClassName: "px-4 py-3 text-right font-bold", render: (row) => money(row.running_balance) },
  ];
  const exportRows = () => exportToCsv({ rows, fileName: `${supplier?.supplier_code || "supplier"}-ledger.csv`, columns: [{ label: "Date", value: "transaction_date" }, { label: "Type", value: "reference_type" }, { label: "Reference", value: "reference_no" }, { label: "Description", value: "description" }, { label: "Purchases", value: "credit" }, { label: "Payments", value: "debit" }, { label: "Balance", value: "running_balance" }] });
  const printRows = () => printContent({ title: `${supplier?.name || "Supplier"} - Ledger Statement`, headers: ["Date", "Type", "Reference", "Description", "Purchases", "Payments", "Balance"], rows: rows.map((row) => [row.transaction_date, row.reference_type, row.reference_no, row.description, row.credit, row.debit, row.running_balance]) });
  return <DashboardLayout><div className="space-y-6">
    <div><Link to="/suppliers" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="size-4" /> Back to suppliers</Link><PageHeader title={supplier?.name || "Supplier Ledger"} description={`${supplier?.supplier_code ? `${supplier.supplier_code} | ` : ""}${supplier?.phone || "Purchase and payment statement"}`} actions={<>{supplier ? <PaySupplierDialog supplier={supplier} /> : null}<ExportButton onExport={exportRows} disabled={!rows.length} label="Export CSV" /><PrintButton onPrint={printRows} disabled={!rows.length} /></>} /></div>
    {query.isError ? <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"><AlertCircle className="size-5 shrink-0" /><div><p className="font-semibold">Supplier statement could not be loaded</p><p className="mt-1 text-sm">{query.error.message}</p><button type="button" onClick={() => query.refetch()} className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white">Try again</button></div></div> : null}
    <LedgerFilters filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY)} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatsCard title="Period Opening" value={money(periodOpening)} icon={WalletCards} tone="violet" /><StatsCard title="Purchases" value={money(credit)} icon={ArrowUpCircle} tone="red" /><StatsCard title="Payments" value={money(debit)} icon={ArrowDownCircle} tone="emerald" /><StatsCard title="Outstanding" value={money(closing)} icon={Scale} tone="amber" /></div>
    <DataTable columns={columns} data={rows} isLoading={query.isLoading} emptyState={<EmptyState title="No supplier transactions" description="Purchases and supplier payments will appear here automatically." />} />
  </div></DashboardLayout>;
}
