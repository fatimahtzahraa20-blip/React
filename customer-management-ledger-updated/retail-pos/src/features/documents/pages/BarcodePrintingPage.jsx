import { useMemo, useState } from "react";
import { Barcode, Printer } from "lucide-react";
import toast from "react-hot-toast";

import {
  DataTable,
  EmptyState,
  PageHeader,
  SearchInput,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/products/hooks/useProducts";
import DashboardLayout from "@/layouts/DashboardLayout";
import ExportMenu from "../components/ExportMenu";
import { printLabels } from "../utils/safePrint";

export default function BarcodePrintingPage() {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [copies, setCopies] = useState(1);
  const [columns, setColumns] = useState(3);
  const [showPrice, setShowPrice] = useState(true);
  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(
    () =>
      products.filter((product) =>
        [product.product_name, product.sku, product.barcode]
          .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())),
      ),
    [products, search],
  );
  const selected = products.filter((product) => selectedIds.includes(product.id));
  const printable = selected.length ? selected : filtered;
  const allVisibleSelected =
    filtered.length > 0 && filtered.every((product) => selectedIds.includes(product.id));

  const toggle = (id) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const columnsConfig = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          aria-label="Select all visible products"
          checked={allVisibleSelected}
          onChange={() =>
            setSelectedIds(
              allVisibleSelected
                ? selectedIds.filter((id) => !filtered.some((product) => product.id === id))
                : [...new Set([...selectedIds, ...filtered.map((product) => product.id)])],
            )
          }
          className="size-4 accent-blue-600"
        />
      ),
      render: (product) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(product.id)}
          onChange={() => toggle(product.id)}
          aria-label={`Select ${product.product_name}`}
          className="size-4 accent-blue-600"
        />
      ),
    },
    { key: "product_name", header: "Product" },
    { key: "sku", header: "SKU" },
    { key: "barcode", header: "Barcode" },
    {
      key: "sale_price",
      header: "Price",
      render: (product) => Number(product.sale_price || 0).toFixed(2),
    },
  ];

  const exportColumns = [
    { label: "Product", value: "product_name" },
    { label: "SKU", value: "sku" },
    { label: "Barcode", value: "barcode" },
    { label: "Sale Price", value: "sale_price" },
  ];

  const handlePrint = () => {
    try {
      printLabels({ products: printable, copies, columns, showPrice });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Barcode & Label Printing"
          description="Select products and print Code 128 labels on configurable A4 sheets."
          actions={
            <>
              <ExportMenu rows={printable} columns={exportColumns} title="Product Barcodes" fileName="product-barcodes" />
              <Button size="lg" onClick={handlePrint} disabled={!printable.length}>
                <Printer />
                Print {selected.length ? `${selected.length} selected` : "visible"}
              </Button>
            </>
          }
        />

        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search products, SKU, barcode..."
            className="sm:max-w-none sm:col-span-2"
          />
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Copies per product</span>
            <input
              type="number"
              min="1"
              max="100"
              value={copies}
              onChange={(event) => setCopies(Math.min(100, Math.max(1, Number(event.target.value))))}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Labels per row</span>
            <select
              value={columns}
              onChange={(event) => setColumns(Number(event.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
            >
              {[2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-4">
            <input
              type="checkbox"
              checked={showPrice}
              onChange={(event) => setShowPrice(event.target.checked)}
              className="size-4 accent-blue-600"
            />
            Show sale price on labels
          </label>
        </div>

        <DataTable
          columns={columnsConfig}
          data={filtered}
          isLoading={isLoading}
          emptyState={<EmptyState icon={Barcode} title="No printable products" description="Products need a SKU or barcode before labels can be printed." />}
        />
      </div>
    </DashboardLayout>
  );
}
