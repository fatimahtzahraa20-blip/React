import { DataTable, EmptyState, StatusBadge } from "@/components/shared";
import ProductActions from "./ProductActions";

const money = (value) => Number(value || 0).toFixed(2);
const columns = [
  { key: "product", header: "Product", render: (product) => <div className="flex items-center gap-3">{product.image_url ? <img src={product.image_url} alt="" className="size-10 rounded-lg object-cover" /> : <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800" />}<div><p className="font-semibold">{product.name}</p><p className="text-xs text-slate-500">{product.sku}</p></div></div> },
  { key: "category", header: "Category", render: (product) => product.category?.name || "—" },
  { key: "brand", header: "Brand", render: (product) => product.brand?.name || "—" },
  { key: "cost_price", header: "Cost", render: (product) => money(product.cost_price) },
  { key: "sale_price", header: "Sale", render: (product) => <span className="font-semibold">{money(product.sale_price)}</span> },
  { key: "stock", header: "Stock", render: (product) => `${Number(product.current_stock ?? product.stock_quantity ?? 0)} ${product.unit?.short_name || ""}` },
  { key: "status", header: "Status", render: (product) => <StatusBadge status={product.status} /> },
  { key: "actions", header: "Actions", headerClassName: "px-4 py-3 text-center font-semibold", cellClassName: "px-4 py-3", render: (product) => <ProductActions product={product} /> },
];

export default function ProductTable({ products, isLoading, pagination }) {
  return <DataTable columns={columns} data={products} isLoading={isLoading} pagination={pagination} emptyState={<EmptyState title="No products found" description="Try changing filters or create your first product." />} />;
}
