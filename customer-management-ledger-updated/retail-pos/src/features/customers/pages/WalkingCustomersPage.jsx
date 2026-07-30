import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Eye, ReceiptText, ShoppingCart, WalletCards } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DataTable, EmptyState, ExportButton, FilterBar, FormInput, FormSelect, PageHeader, PrintButton, StatsCard, StatusBadge } from "@/components/shared";
import exportToCsv from "@/utils/exportToCsv";
import printContent from "@/utils/printContent";
import { getWalkingCustomerSales } from "../services/walkingCustomerService";

const EMPTY = { search: "", from: "", to: "", method: "" };
const money = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const displayDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-";

export default function WalkingCustomersPage() {
  const [filters, setFilters] = useState(EMPTY);
  const query = useQuery({ queryKey: ["walking-customer-sales"], queryFn: getWalkingCustomerSales });
  const sales = query.data || [];
  const filtered = useMemo(() => sales.filter((sale) => {
    if (filters.search && !String(sale.invoice_no || "").toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.from && sale.invoice_date < filters.from) return false;
    if (filters.to && sale.invoice_date > filters.to) return false;
    if (filters.method && sale.payment_method !== filters.method) return false;
    return true;
  }), [sales, filters]);
  const completed = filtered.filter((sale) => sale.status !== "cancelled");
  const revenue = completed.reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);
  const collected = completed.reduce((sum, sale) => sum + Number(sale.paid_amount || 0), 0);
  const columns = [
    { key: "invoice_no", header: "Invoice", render: (sale) => <Link to={`/sales/${sale.id}`} className="font-semibold text-blue-600 hover:underline">{sale.invoice_no}</Link> },
    { key: "invoice_date", header: "Date", render: (sale) => displayDate(sale.invoice_date) },
    { key: "payment_method", header: "Payment", render: (sale) => <span className="capitalize">{sale.payment_method || "cash"}</span> },
    { key: "grand_total", header: "Total", headerClassName: "px-4 py-3 text-right font-semibold", cellClassName: "px-4 py-3 text-right font-semibold", render: (sale) => money(sale.grand_total) },
    { key: "paid_amount", header: "Paid", headerClassName: "px-4 py-3 text-right font-semibold", cellClassName: "px-4 py-3 text-right text-emerald-600", render: (sale) => money(sale.paid_amount) },
    { key: "status", header: "Status", render: (sale) => <StatusBadge status={sale.status === "completed" ? "success" : sale.status === "cancelled" ? "danger" : "warning"} label={sale.status} /> },
    { key: "action", header: "", render: (sale) => <Link to={`/sales/${sale.id}`} title="View invoice" className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800"><Eye className="size-4" /></Link> },
  ];
  const exportRows = () => exportToCsv({ rows: filtered, fileName: "walking-customer-sales.csv", columns: [{ label: "Invoice", value: "invoice_no" }, { label: "Date", value: "invoice_date" }, { label: "Payment", value: "payment_method" }, { label: "Total", value: "grand_total" }, { label: "Paid", value: "paid_amount" }, { label: "Status", value: "status" }] });
  const printRows = () => printContent({ title: "Walking Customer Sales", headers: ["Invoice", "Date", "Payment", "Total", "Paid", "Status"], rows: filtered.map((sale) => [sale.invoice_no, sale.invoice_date, sale.payment_method, sale.grand_total, sale.paid_amount, sale.status]) });
  const active = Object.values(filters).some(Boolean);
  return (
    <DashboardLayout><div className="space-y-6">
      <PageHeader title="Walking Customers" description="Cash-and-carry sales completed without a registered customer." actions={<><ExportButton onExport={exportRows} disabled={!filtered.length} label="Export CSV" /><PrintButton onPrint={printRows} disabled={!filtered.length} /><Link to="/pos" className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><ShoppingCart className="size-4" /> New POS Sale</Link></>} />
      <div className="grid gap-4 sm:grid-cols-3"><StatsCard title="Walk-in Invoices" value={completed.length.toLocaleString()} icon={ReceiptText} /><StatsCard title="Gross Sales" value={money(revenue)} icon={WalletCards} tone="emerald" /><StatsCard title="Amount Collected" value={money(collected)} icon={WalletCards} tone="violet" /></div>
      <FilterBar active={active} onReset={() => setFilters(EMPTY)}><FormInput label="Search invoice" placeholder="Invoice number" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-52" /><FormInput label="From" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /><FormInput label="To" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /><FormSelect label="Payment method" options={[{ value: "cash", label: "Cash" }, { value: "card", label: "Card" }]} value={filters.method} onChange={(e) => setFilters({ ...filters, method: e.target.value })} /></FilterBar>
      {query.isError ? <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"><p className="font-semibold">Walking customer sales could not be loaded</p><p className="mt-1 text-sm">{query.error.message}</p><button type="button" onClick={() => query.refetch()} className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white">Try again</button></div> : <DataTable columns={columns} data={filtered} isLoading={query.isLoading} emptyState={<EmptyState title="No walking customer sales" description="Complete a fully paid POS sale with Walking customer selected and it will appear here." />} />}
    </div></DashboardLayout>
  );
}
