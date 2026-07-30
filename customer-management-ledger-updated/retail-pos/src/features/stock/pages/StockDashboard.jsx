import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, PackageX, SlidersHorizontal } from "lucide-react";

import { FilterBar, Modal, PageHeader, SearchInput, StatsCard } from "@/components/shared";
import usePagination from "@/hooks/usePagination";
import DashboardLayout from "@/layouts/DashboardLayout";
import StockAdjustmentForm from "../components/StockAdjustmentForm";
import StockTable from "../components/StockTable";
import { useStock, useWarehouses } from "../hooks/useStock";
import useStockStore from "../store/stockStore";

export default function StockDashboard() {
  const [adjustmentType, setAdjustmentType] = useState(null);
  const search = useStockStore((state) => state.search);
  const view = useStockStore((state) => state.view);
  const warehouseId = useStockStore((state) => state.warehouseId);
  const setSearch = useStockStore((state) => state.setSearch);
  const setView = useStockStore((state) => state.setView);
  const setWarehouseId = useStockStore((state) => state.setWarehouseId);
  const resetFilters = useStockStore((state) => state.resetFilters);
  const { data: stock = [], isLoading, isError, error, refetch } = useStock();
  const { data: warehouses = [] } = useWarehouses();
  const stockLevel = (row) => {
    const quantity = Number(row.quantity || 0);
    if (quantity === 0) return "out";
    if (quantity <= Number(row.product?.minimum_stock || 0)) return "low";
    return "available";
  };
  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return stock.filter((row) => {
      const matchesSearch = !keyword || [
        row.product?.product_name,
        row.product?.name,
        row.product?.sku,
        row.product?.product_code,
        row.product?.barcode,
      ].some((value) => String(value || "").toLowerCase().includes(keyword));
      const matchesView = view === "all" || stockLevel(row) === view;
      const matchesWarehouse = warehouseId === "all" || String(row.warehouse_id) === warehouseId;
      return matchesSearch && matchesView && matchesWarehouse;
    });
  }, [stock, search, view, warehouseId]);
  const pagination = usePagination(filtered, 10);
  const low = stock.filter((row) => stockLevel(row) === "low").length;
  const out = stock.filter((row) => stockLevel(row) === "out").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Stock Management" description="Monitor inventory levels across warehouses and record controlled adjustments." actions={<><button type="button" onClick={() => setAdjustmentType("damage")} className="h-10 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600">Record Damage</button><button type="button" onClick={() => setAdjustmentType("adjustment")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><SlidersHorizontal className="size-4" /> Adjust Stock</button></>} />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Stock Records" value={stock.length} icon={Boxes} />
          <StatsCard title="Low Stock" value={low} icon={AlertTriangle} tone="amber" />
          <StatsCard title="Out of Stock" value={out} icon={PackageX} tone="red" />
        </div>
        <FilterBar onReset={() => { resetFilters(); pagination.resetPage(); }} active={Boolean(search) || view !== "all" || warehouseId !== "all"}>
          <SearchInput value={search} onChange={(value) => { setSearch(value); pagination.resetPage(); }} placeholder="Search products or barcode..." />
          <select value={view} onChange={(e) => { setView(e.target.value); pagination.resetPage(); }} className="h-10 rounded-lg border bg-white px-3 text-sm dark:bg-slate-900"><option value="all">All stock</option><option value="available">Available</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
          <select value={warehouseId} onChange={(e) => { setWarehouseId(e.target.value); pagination.resetPage(); }} className="h-10 rounded-lg border bg-white px-3 text-sm dark:bg-slate-900"><option value="all">All warehouses</option>{warehouses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        </FilterBar>
        {isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 dark:bg-red-950/20">
            <p className="font-semibold">Stock could not be loaded.</p>
            <p className="mt-1 text-sm">{error?.message}</p>
            <button type="button" onClick={() => refetch()} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
          </div>
        ) : (
          <StockTable stock={pagination.paginatedItems} isLoading={isLoading} pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }} />
        )}
      </div>
      <Modal open={Boolean(adjustmentType)} onClose={() => setAdjustmentType(null)} title={adjustmentType === "damage" ? "Record Damaged Stock" : "Stock Adjustment"} description="Every change creates an immutable stock movement record.">
        {adjustmentType ? <StockAdjustmentForm defaultType={adjustmentType} onSuccess={() => setAdjustmentType(null)} /> : null}
      </Modal>
    </DashboardLayout>
  );
}
