import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DataTable, ExportButton, PageHeader, PrintButton, StatsCard, StatusBadge } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import printContent from "@/utils/printContent";
import { getFinancialReport, getReportData } from "../services/reportService";

const money = (value) => Number(value || 0).toFixed(2);
const label = (value) => String(value || "-").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const status = (_value, row) => <StatusBadge status={["posted", "completed", "active", true].includes(row.status) ? "success" : row.status === false ? "inactive" : "warning"} label={row.status === true ? "Active" : row.status === false ? "Inactive" : label(row.status)} />;

const REPORTS = {
  sales: { label: "Sales", columns: [["invoice_no", "Invoice"], ["invoice_date", "Date"], ["party_name", "Customer"], ["grand_total", "Total", money], ["paid_amount", "Paid", money], ["due_amount", "Due", money], ["payment_method", "Payment", label], ["status", "Status", status]] },
  purchases: { label: "Purchases", columns: [["purchase_no", "Purchase"], ["purchase_date", "Date"], ["party_name", "Supplier"], ["grand_total", "Total", money], ["paid_amount", "Paid", money], ["due_amount", "Payable", money], ["payment_method", "Payment", label], ["status", "Status", status]] },
  products: { label: "Products", columns: [["product_code", "Code", (value, row) => value || row.sku || row.barcode || "-"], ["product_name", "Product", (value, row) => value || row.name], ["category_name", "Category"], ["purchase_price", "Cost", money], ["sale_price", "Sale Price", money], ["minimum_stock", "Minimum Stock"], ["status", "Status", status]] },
  customers: { label: "Customers", columns: [["customer_code", "Code"], ["party_name", "Customer"], ["phone", "Phone"], ["customer_type", "Type", label], ["opening_balance", "Opening", money], ["current_balance", "Outstanding", money], ["credit_limit", "Credit Limit", money], ["status", "Status", status]] },
  suppliers: { label: "Suppliers", columns: [["supplier_code", "Code"], ["party_name", "Supplier"], ["phone", "Phone"], ["opening_balance", "Opening", money], ["current_balance", "Payable", money], ["credit_limit", "Credit Limit", money], ["status", "Status", status]] },
  expenses: { label: "Expenses", columns: [["expense_no", "Expense"], ["expense_date", "Date"], ["category_name", "Category"], ["description", "Description"], ["payment_method", "Paid From", label], ["amount", "Amount", money], ["status", "Status", status]] },
  incomes: { label: "Income", columns: [["income_no", "Receipt"], ["income_date", "Date"], ["category_name", "Category"], ["description", "Description"], ["payment_method", "Received In", label], ["amount", "Amount", money], ["status", "Status", status]] },
  payments: { label: "Payments", columns: [["receipt_no", "Receipt"], ["payment_date", "Date"], ["party_name", "Party"], ["party_type", "Category", (value) => value === "customer" ? "Customer Receipt" : "Supplier Payment"], ["payment_method", "Method", label], ["amount", "Amount", money], ["status", "Status", status]] },
  stock: { label: "Stock", columns: [["product_name", "Product"], ["warehouse_name", "Warehouse"], ["quantity", "On Hand"], ["average_cost", "Average Cost", money], ["updated_at", "Last Updated", (value) => value ? new Date(value).toLocaleDateString() : "-"]] },
};

function metricsFor(type, rows) {
  const sum = (key, predicate = () => true) => rows.filter(predicate).reduce((total, row) => total + Number(row[key] || 0), 0);
  if (type === "sales") return [["Invoices", rows.length], ["Gross Sales", money(sum("grand_total"))], ["Collected", money(sum("paid_amount"))], ["Outstanding", money(sum("due_amount"))]];
  if (type === "purchases") return [["Purchases", rows.length], ["Purchase Value", money(sum("grand_total"))], ["Paid", money(sum("paid_amount"))], ["Payable", money(sum("due_amount"))]];
  if (type === "expenses") return [["Expense Entries", rows.length], ["Posted Expenses", money(sum("amount", (row) => row.status === "posted"))], ["Reversed", rows.filter((row) => row.status === "reversed").length], ["Categories Used", new Set(rows.map((row) => row.category_id)).size]];
  if (type === "incomes") return [["Income Entries", rows.length], ["Posted Income", money(sum("amount", (row) => row.status === "posted"))], ["Cash Received", money(sum("amount", (row) => row.payment_method === "cash" && row.status === "posted"))], ["Bank Received", money(sum("amount", (row) => row.payment_method === "bank" && row.status === "posted"))]];
  if (type === "payments") return [["Payments", rows.length], ["Customer Receipts", money(sum("amount", (row) => row.party_type === "customer"))], ["Supplier Payments", money(sum("amount", (row) => row.party_type === "supplier"))], ["Bank Transactions", money(sum("amount", (row) => row.payment_method === "bank"))]];
  if (type === "products") return [["Products", rows.length], ["Active", rows.filter((row) => row.status !== false).length], ["Average Cost", money(rows.length ? sum("purchase_price") / rows.length : 0)], ["Average Sale Price", money(rows.length ? sum("sale_price") / rows.length : 0)]];
  if (type === "stock") return [["Stock Records", rows.length], ["Units On Hand", sum("quantity")], ["Out of Stock", rows.filter((row) => Number(row.quantity) <= 0).length], ["Inventory Cost", money(rows.reduce((total, row) => total + Number(row.quantity || 0) * Number(row.average_cost || 0), 0))]];
  const balanceKey = type === "customers" ? "current_balance" : "current_balance";
  return [[REPORTS[type].label, rows.length], ["Active", rows.filter((row) => row.status !== false).length], [type === "customers" ? "Outstanding" : "Payable", money(sum(balanceKey))], ["With Balance", rows.filter((row) => Number(row[balanceKey]) > 0).length]];
}

export default function ReportsPage({ initialType = "sales" }) {
  const today = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState({ type: initialType, from: `${today.slice(0, 8)}01`, to: today });
  useEffect(() => {
    setFilters((current) => current.type === initialType ? current : { ...current, type: initialType });
  }, [initialType]);
  const query = useQuery({ queryKey: ["report", filters], queryFn: () => getReportData(filters) });
  const financeQuery = useQuery({ queryKey: ["financial-report", filters.from, filters.to], queryFn: () => getFinancialReport(filters) });
  const rows = query.data || [];
  const definition = REPORTS[filters.type];
  const columns = useMemo(() => definition.columns.map(([key, header, formatter]) => ({ key, header, render: formatter ? (row) => formatter(row[key], row) : undefined })), [definition]);
  const metrics = metricsFor(filters.type, rows);
  const chart = Object.entries(financeQuery.data || {}).filter(([key]) => ["revenue", "purchases", "expenses", "profit"].includes(key)).map(([name, value]) => ({ name: label(name), value }));
  const exportValue = (row, column) => {
    const value = row[column[0]];
    if (column[0] === "status") return value === true ? "Active" : value === false ? "Inactive" : label(value);
    if (column[0] === "party_type") return value === "customer" ? "Customer Receipt" : "Supplier Payment";
    return typeof column[2] === "function" && column[2] !== status ? column[2](value, row) : value ?? "";
  };
  const print = () => printContent({ title: `${definition.label} Report`, headers: definition.columns.map((column) => column[1]), rows: rows.map((row) => definition.columns.map((column) => exportValue(row, column))) });
  const exportCsv = async () => (await import("@/utils/exportToCsv")).default({ rows, fileName: `${filters.type}-report.csv`, columns: definition.columns.map((column) => ({ label: column[1], value: (row) => exportValue(row, column) })) });

  return <DashboardLayout><div className="space-y-6">
    <PageHeader title={`${definition.label} Report`} description="Report-specific operational and financial information for the selected period." actions={<><ExportButton onExport={exportCsv} disabled={!rows.length} label="Export CSV" /><PrintButton onPrint={print} disabled={!rows.length} /></>} />
    <div className="flex flex-wrap gap-3">
      <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} className="h-10 rounded-md border bg-white px-3 capitalize dark:bg-slate-900">{Object.entries(REPORTS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select>
      <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className="h-10 rounded-md border bg-white px-3 dark:bg-slate-900" />
      <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className="h-10 rounded-md border bg-white px-3 dark:bg-slate-900" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([title, value], index) => <StatsCard key={title} title={title} value={value} tone={[undefined, "emerald", "amber", "blue"][index]} />)}</div>
    {filters.type === "sales" && <div className="h-72 rounded-lg border bg-white p-4 dark:bg-slate-900"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}
    {query.isError ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">{query.error.message}<button type="button" onClick={() => query.refetch()} className="ml-3 font-semibold underline">Retry</button></div> : <DataTable columns={columns} data={rows} isLoading={query.isLoading} />}
  </div></DashboardLayout>;
}