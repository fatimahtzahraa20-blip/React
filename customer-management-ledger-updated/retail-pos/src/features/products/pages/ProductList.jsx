import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Boxes, PackagePlus, Plus } from "lucide-react";

import { ExportButton, FilterBar, PageHeader, PrintButton, SearchInput, StatsCard } from "@/components/shared";
import { useCategories } from "@/features/categories/hooks/useCategories";
import usePagination from "@/hooks/usePagination";
import DashboardLayout from "@/layouts/DashboardLayout";
import printContent from "@/utils/printContent";
import ProductTable from "../components/ProductTable";
import { useProducts } from "../hooks/useProducts";
import useProductStore from "../store/productStore";

export default function ProductList() {
  const search = useProductStore((state) => state.search);
  const status = useProductStore((state) => state.status);
  const categoryId = useProductStore((state) => state.categoryId);
  const setSearch = useProductStore((state) => state.setSearch);
  const setStatus = useProductStore((state) => state.setStatus);
  const setCategoryId = useProductStore((state) => state.setCategoryId);
  const resetFilters = useProductStore((state) => state.resetFilters);
  const { data: products = [], isLoading, isError, error, refetch } = useProducts();
  const { data: categories = [] } = useCategories();

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !keyword || [product.name, product.sku, product.barcode].some((value) => String(value || "").toLowerCase().includes(keyword));
      const matchesStatus = status === "all" || (status === "active" ? product.status : !product.status);
      const matchesCategory = categoryId === "all" || String(product.category_id) === categoryId;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, status, categoryId]);
  const pagination = usePagination(filtered, 10);
  const stockOf = (product) => Number(product.current_stock ?? product.stock_quantity ?? 0);
  const lowStock = products.filter((product) => stockOf(product) <= Number(product.minimum_stock || 0)).length;
  const printRows = () => printContent({ title: "Product Report", headers: ["SKU", "Name", "Category", "Brand", "Cost", "Sale", "Stock"], rows: filtered.map((p) => [p.sku, p.name, p.category?.name || "", p.brand?.name || "", p.cost_price, p.sale_price, stockOf(p)]) });
  const exportPdf = async () => (await import("../utils/productExports")).exportProductsPdf(filtered);
  const exportExcel = async () => (await import("../utils/productExports")).exportProductsExcel(filtered);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Products" description="Manage product catalog, pricing, identifiers, and stock thresholds." actions={<><ExportButton onExport={exportPdf} disabled={!filtered.length} label="Export PDF" /><ExportButton onExport={exportExcel} disabled={!filtered.length} label="Export Excel" /><PrintButton onPrint={printRows} disabled={!filtered.length} /><Link to="/products/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="size-4" /> Add Product</Link></>} />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Total Products" value={products.length} icon={Boxes} />
          <StatsCard title="Active Products" value={products.filter((p) => p.status).length} icon={PackagePlus} tone="emerald" />
          <StatsCard title="Low Stock" value={lowStock} icon={AlertTriangle} tone="amber" />
        </div>
        <FilterBar onReset={() => { resetFilters(); pagination.resetPage(); }} active={Boolean(search) || status !== "all" || categoryId !== "all"}>
          <SearchInput value={search} onChange={(value) => { setSearch(value); pagination.resetPage(); }} placeholder="Search name, SKU, or barcode..." />
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); pagination.resetPage(); }} className="h-10 rounded-lg border bg-white px-3 text-sm dark:bg-slate-900"><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); pagination.resetPage(); }} className="h-10 rounded-lg border bg-white px-3 text-sm dark:bg-slate-900"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        </FilterBar>
        {isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 dark:bg-red-950/20">
            <p className="font-semibold">Products could not be loaded.</p>
            <p className="mt-1 text-sm">{error?.message}</p>
            <button type="button" onClick={() => refetch()} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
          </div>
        ) : (
          <ProductTable products={pagination.paginatedItems} isLoading={isLoading} pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }} />
        )}
      </div>
    </DashboardLayout>
  );
}
