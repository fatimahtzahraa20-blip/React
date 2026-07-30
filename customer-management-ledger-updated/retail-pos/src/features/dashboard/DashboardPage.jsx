import { Link } from "react-router-dom";
import dayjs from "dayjs";

import { DataTable, LoadingSkeleton, PageHeader, StatusBadge } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import AnalyticsChart from "./AnalyticsChart";
import QuickActions from "./QuickActions";
import RankingCard from "./RankingCard";
import StatsGrid from "./StatsGrid";
import useDashboardAnalytics from "./hooks/useDashboardAnalytics";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardAnalytics();
  if (isLoading) return <DashboardLayout><LoadingSkeleton rows={8} /></DashboardLayout>;

  const invoiceColumns = [
    { key: "invoice_no", header: "Invoice", render: (invoice) => <Link to={`/sales/${invoice.id}`} className="font-semibold text-blue-600">{invoice.invoice_no}</Link> },
    { key: "customer", header: "Customer", render: (invoice) => invoice.customer?.name || "Walking Customer" },
    { key: "invoice_date", header: "Date", render: (invoice) => dayjs(invoice.invoice_date).format("DD MMM YYYY") },
    { key: "grand_total", header: "Total", render: (invoice) => Number(invoice.grand_total || 0).toFixed(2) },
    { key: "due_amount", header: "Due", render: (invoice) => Number(invoice.due_amount || 0).toFixed(2) },
  ];
  const purchaseColumns = [
    { key: "purchase_no", header: "Purchase", render: (purchase) => <Link to="/purchases" className="font-semibold text-blue-600">{purchase.purchase_no || "Purchase #" + purchase.id}</Link> },
    { key: "supplier", header: "Supplier", render: (purchase) => purchase.supplier?.name || "Supplier" },
    { key: "purchase_date", header: "Date", render: (purchase) => dayjs(purchase.purchase_date).format("DD MMM YYYY") },
    { key: "grand_total", header: "Total", render: (purchase) => Number(purchase.grand_total || 0).toFixed(2) },
    { key: "due_amount", header: "Payable", render: (purchase) => <span className="font-semibold text-amber-600">{Number(purchase.due_amount || 0).toFixed(2)}</span> },
  ];
  const stockColumns = [
    { key: "product", header: "Product", render: (row) => row.product?.product_name || "—" },
    { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse?.name || "—" },
    { key: "quantity", header: "Stock", render: (row) => <span className="font-bold">{Number(row.quantity || 0)}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={Number(row.quantity) === 0 ? "danger" : "warning"} label={Number(row.quantity) === 0 ? "Out of stock" : "Low stock"} /> },
  ];

  if (isError) {
    return <DashboardLayout><div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"><h1 className="font-semibold text-red-700">Dashboard analytics could not be loaded.</h1><button type="button" onClick={() => refetch()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white">Retry</button></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Live business performance, inventory alerts, and recent activity. Refreshes every minute." />
        <StatsGrid stats={data.stats} />
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <AnalyticsChart data={data.chart} />
          <QuickActions />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <RankingCard title="Best Selling Products" items={data.bestSelling} valueKey="quantity" valueLabel="sold" />
          <RankingCard title="Top Customers" items={data.topCustomers} />
          <RankingCard title="Top Suppliers" items={data.topSuppliers} />
        </div>
        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Recent Purchases</h2><Link to="/purchases" className="text-sm font-semibold text-blue-600">View all</Link></div>
          <DataTable columns={purchaseColumns} data={data.recentPurchases} />
        </section>
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="space-y-3"><h2 className="text-lg font-semibold">Recent Invoices</h2><DataTable columns={invoiceColumns} data={data.recentInvoices} /></section>
          <section className="space-y-3"><h2 className="text-lg font-semibold">Low Stock Alerts</h2><DataTable columns={stockColumns} data={data.lowStock} /></section>
        </div>
      </div>
    </DashboardLayout>
  );
}
