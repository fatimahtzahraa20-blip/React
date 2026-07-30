import { DataTable, EmptyState, StatusBadge } from "@/components/shared";

const columns = [
  { key: "product", header: "Product", render: (row) => <div><p className="font-semibold">{row.product?.product_name}</p><p className="text-xs text-slate-500">{row.product?.barcode || "No barcode"}</p></div> },
  { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse?.name || "—" },
  { key: "quantity", header: "Current Stock", render: (row) => <span className="text-base font-bold">{Number(row.quantity || 0)}</span> },
  { key: "minimum", header: "Minimum", render: (row) => Number(row.product?.minimum_stock || 0) },
  { key: "level", header: "Level", render: (row) => {
    const quantity = Number(row.quantity || 0);
    const minimum = Number(row.product?.minimum_stock || 0);
    return <StatusBadge status={quantity === 0 ? "danger" : quantity <= minimum ? "warning" : "success"} label={quantity === 0 ? "Out of stock" : quantity <= minimum ? "Low stock" : "In stock"} />;
  } },
];

export default function StockTable({ stock, isLoading, pagination }) {
  return <DataTable columns={columns} data={stock} isLoading={isLoading} pagination={pagination} emptyState={<EmptyState title="No stock records" description="Stock records appear after opening stock, purchases, or adjustments." />} />;
}
