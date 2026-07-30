import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Building2, Scale, Search, WalletCards } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DataTable, EmptyState, ExportButton, PageHeader, PrintButton, StatsCard, StatusBadge } from "@/components/shared";
import useSuppliers from "@/hooks/useSuppliers";
import exportToCsv from "@/utils/exportToCsv";
import printContent from "@/utils/printContent";
import PaySupplierDialog from "../components/PaySupplierDialog";

const money = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SupplierLedgerIndex() {
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("outstanding");
  const { data: suppliers = [], isLoading, isError, error, refetch } = useSuppliers();
  const rows = useMemo(() => suppliers.filter((supplier) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || [supplier.name, supplier.phone, supplier.supplier_code].some((value) => String(value || "").toLowerCase().includes(keyword));
    const balance = Number(supplier.current_balance || 0);
    const matchesBalance = balanceFilter === "all" || (balanceFilter === "outstanding" ? balance > 0 : balance <= 0);
    return matchesSearch && matchesBalance;
  }), [suppliers, search, balanceFilter]);
  const activeSuppliers = suppliers.filter((supplier) => supplier.status !== false);
  const totalOutstanding = activeSuppliers.reduce((sum, supplier) => sum + Math.max(0, Number(supplier.current_balance || 0)), 0);
  const totalOpening = activeSuppliers.reduce((sum, supplier) => sum + Number(supplier.opening_balance || 0), 0);
  const withBalance = activeSuppliers.filter((supplier) => Number(supplier.current_balance || 0) > 0).length;
  const columns = [
    { key: "supplier_code", header: "Code", render: (supplier) => <span className="font-medium text-slate-500">{supplier.supplier_code || "-"}</span> },
    { key: "name", header: "Supplier", render: (supplier) => <div><Link to={`/suppliers/${supplier.id}/ledger`} className="font-semibold text-slate-900 hover:text-blue-600 dark:text-white">{supplier.name}</Link><p className="mt-0.5 text-xs text-slate-400">{supplier.phone || "No phone"}</p></div> },
    { key: "opening_balance", header: "Opening", headerClassName: "px-4 py-3 text-right font-semibold", cellClassName: "px-4 py-3 text-right", render: (supplier) => money(supplier.opening_balance) },
    { key: "current_balance", header: "Outstanding Payable", headerClassName: "px-4 py-3 text-right font-semibold", cellClassName: "px-4 py-3 text-right", render: (supplier) => <span className={`font-bold ${Number(supplier.current_balance || 0) > 0 ? "text-amber-600" : "text-emerald-600"}`}>{money(supplier.current_balance)}</span> },
    { key: "balance_status", header: "Account", render: (supplier) => <StatusBadge status={Number(supplier.current_balance || 0) > 0 ? "warning" : "success"} label={Number(supplier.current_balance || 0) > 0 ? "Payable" : "Settled"} /> },
    { key: "actions", header: "Actions", headerClassName: "px-4 py-3 text-right font-semibold", cellClassName: "px-4 py-3", render: (supplier) => <div className="flex justify-end gap-2"><Link to={`/suppliers/${supplier.id}/ledger`} className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-semibold hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:hover:bg-slate-800"><BookOpen className="size-4" /> Statement</Link><PaySupplierDialog supplier={supplier} /></div> },
  ];
  const exportRows = () => exportToCsv({ rows, fileName: "supplier-payables.csv", columns: [{ label: "Code", value: "supplier_code" }, { label: "Supplier", value: "name" }, { label: "Phone", value: "phone" }, { label: "Opening Balance", value: "opening_balance" }, { label: "Outstanding Payable", value: "current_balance" }] });
  const printRows = () => printContent({ title: "Supplier Payables Ledger", headers: ["Code", "Supplier", "Phone", "Opening", "Outstanding"], rows: rows.map((supplier) => [supplier.supplier_code, supplier.name, supplier.phone, supplier.opening_balance || 0, supplier.current_balance || 0]) });
  return <DashboardLayout><div className="space-y-6">
    <PageHeader title="Supplier Ledger" description="Monitor accounts payable, review balances, post payments, and open supplier statements." actions={<><ExportButton onExport={exportRows} disabled={!rows.length} label="Export Ledger" /><PrintButton onPrint={printRows} disabled={!rows.length} /></>} />
    <div className="grid gap-4 sm:grid-cols-3"><StatsCard title="Total Payable" value={money(totalOutstanding)} icon={WalletCards} tone="amber" /><StatsCard title="Suppliers with Balance" value={withBalance.toLocaleString()} icon={Building2} tone="red" /><StatsCard title="Total Opening Balance" value={money(totalOpening)} icon={Scale} tone="violet" /></div>
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplier, code, or phone..." className="h-10 w-full rounded-md border border-slate-200 bg-transparent pl-10 pr-3 text-sm dark:border-slate-700" /></div><div className="flex rounded-md bg-slate-100 p-1 dark:bg-slate-800">{[["outstanding", "Outstanding"], ["settled", "Settled"], ["all", "All"]].map(([value, label]) => <button key={value} type="button" onClick={() => setBalanceFilter(value)} className={`rounded px-3 py-1.5 text-xs font-semibold transition ${balanceFilter === value ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-300" : "text-slate-500"}`}>{label}</button>)}</div></div>
    {isError ? <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"><p className="font-semibold">Supplier payables could not be loaded</p><p className="mt-1 text-sm">{error.message}</p><button type="button" onClick={() => refetch()} className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white">Try again</button></div> : <DataTable columns={columns} data={rows} isLoading={isLoading} emptyState={<EmptyState title="No supplier accounts found" description="Change the balance filter or add supplier transactions to view payable accounts." />} />}
  </div></DashboardLayout>;
}
