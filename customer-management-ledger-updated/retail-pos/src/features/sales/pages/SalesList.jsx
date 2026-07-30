import { useMemo } from "react";
import { FileText } from "lucide-react";

import { ExportButton, FilterBar, PageHeader, PrintButton, SearchInput, StatsCard } from "@/components/shared";
import usePagination from "@/hooks/usePagination";
import DashboardLayout from "@/layouts/DashboardLayout";
import printContent from "@/utils/printContent";
import SalesTable from "../components/SalesTable";
import { useSales } from "../hooks/useSales";
import useSalesStore from "../store/salesStore";

export default function SalesList() {
  const search = useSalesStore((s) => s.search);
  const status = useSalesStore((s) => s.status);
  const setSearch = useSalesStore((s) => s.setSearch);
  const setStatus = useSalesStore((s) => s.setStatus);
  const reset = useSalesStore((s) => s.reset);
  const { data: sales = [], isLoading } = useSales();
  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return sales.filter((sale) => (!keyword || [sale.invoice_no, sale.customer?.name, sale.customer?.phone].some((v) => String(v || "").toLowerCase().includes(keyword))) && (status === "all" || sale.status === status));
  }, [sales, search, status]);
  const pagination = usePagination(filtered, 10);
  const totalRevenue = sales.filter((s) => s.status !== "cancelled").reduce((sum, s) => sum + Number(s.grand_total || 0), 0);
  const print = () => printContent({ title: "Sales Report", headers: ["Invoice", "Date", "Customer", "Total", "Paid", "Due", "Status"], rows: filtered.map((s) => [s.invoice_no, s.invoice_date, s.customer?.name || "Walking Customer", s.grand_total, s.paid_amount, s.due_amount, s.status]) });
  const pdf = async () => (await import("../utils/salesPdf")).exportSalesPdf(filtered);
  return <DashboardLayout><div className="space-y-6"><PageHeader title="Sales Management" description="Review invoices, customer history, returns, cancellations, and accounting entries." actions={<><ExportButton onExport={pdf} disabled={!filtered.length} label="Export PDF" /><PrintButton onPrint={print} disabled={!filtered.length} /></>} /><div className="grid gap-4 sm:grid-cols-3"><StatsCard title="Invoices" value={sales.length} icon={FileText} /><StatsCard title="Revenue" value={totalRevenue.toFixed(2)} icon={FileText} tone="emerald" /><StatsCard title="Outstanding" value={sales.reduce((sum, s) => sum + Number(s.due_amount || 0), 0).toFixed(2)} icon={FileText} tone="amber" /></div><FilterBar onReset={() => { reset(); pagination.resetPage(); }} active={Boolean(search) || status !== "all"}><SearchInput value={search} onChange={(v) => { setSearch(v); pagination.resetPage(); }} placeholder="Search invoice or customer..." /><select value={status} onChange={(e) => { setStatus(e.target.value); pagination.resetPage(); }} className="h-10 rounded-lg border bg-white px-3 dark:bg-slate-900"><option value="all">All statuses</option><option value="completed">Completed</option><option value="partially_returned">Partially returned</option><option value="returned">Returned</option><option value="cancelled">Cancelled</option></select></FilterBar><SalesTable sales={pagination.paginatedItems} isLoading={isLoading} pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }} /></div></DashboardLayout>;
}
