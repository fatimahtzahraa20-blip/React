import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Boxes, DollarSign, Package, TriangleAlert } from "lucide-react";

import { DataTable, EmptyState, LoadingSkeleton, PageHeader, StatsCard, StatusBadge } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useProduct, useProductHistory } from "../hooks/useProducts";

export default function ProductDetails() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: history = [], isLoading: historyLoading } = useProductHistory(id);
  if (isLoading) return <DashboardLayout><LoadingSkeleton /></DashboardLayout>;

  const stock = Number(product.current_stock ?? product.stock_quantity ?? 0);
  const historyColumns = [
    { key: "created_at", header: "Date", render: (row) => dayjs(row.created_at).format("DD MMM YYYY, hh:mm A") },
    { key: "movement_type", header: "Movement", render: (row) => <span className="capitalize">{String(row.movement_type || "").replaceAll("_", " ")}</span> },
    { key: "reference_type", header: "Reference", render: (row) => row.reference_type || "—" },
    { key: "quantity", header: "Quantity", render: (row) => <span className="font-semibold">{Number(row.quantity || 0)}</span> },
    { key: "notes", header: "Notes" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title={product.name} description={`${product.sku} · ${product.barcode || "No barcode"}`} actions={<StatusBadge status={product.status} />} />
        <div className="grid gap-4 sm:grid-cols-4">
          <StatsCard title="Current Stock" value={`${stock} ${product.unit?.short_name || ""}`} icon={Boxes} />
          <StatsCard title="Cost Price" value={Number(product.cost_price || 0).toFixed(2)} icon={DollarSign} />
          <StatsCard title="Sale Price" value={Number(product.sale_price || 0).toFixed(2)} icon={Package} tone="emerald" />
          <StatsCard title="Minimum Stock" value={Number(product.minimum_stock || 0)} icon={TriangleAlert} tone="amber" />
        </div>
        <div className="grid gap-4 rounded-xl border bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
          <div><p className="text-slate-500">Category</p><p className="mt-1 font-semibold">{product.category?.name || "—"}</p></div>
          <div><p className="text-slate-500">Brand</p><p className="mt-1 font-semibold">{product.brand?.name || "—"}</p></div>
          <div><p className="text-slate-500">Unit</p><p className="mt-1 font-semibold">{product.unit?.name || "—"}</p></div>
        </div>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Product Stock History & Ledger</h2>
          <DataTable columns={historyColumns} data={history} isLoading={historyLoading} emptyState={<EmptyState title="No stock movements" description="Stock movement history will appear after opening stock, purchases, sales, or adjustments." />} />
        </section>
      </div>
    </DashboardLayout>
  );
}
