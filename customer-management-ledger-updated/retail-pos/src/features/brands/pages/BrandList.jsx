import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Tags } from "lucide-react";

import {
  ExportButton,
  FilterBar,
  PageHeader,
  PrintButton,
  SearchInput,
  StatsCard,
} from "@/components/shared";
import usePagination from "@/hooks/usePagination";
import DashboardLayout from "@/layouts/DashboardLayout";
import printContent from "@/utils/printContent";
import BrandTable from "../components/BrandTable";
import { useBrands } from "../hooks/useBrands";
import useBrandStore from "../store/brandStore";

export default function BrandList() {
  const search = useBrandStore((state) => state.search);
  const status = useBrandStore((state) => state.status);
  const setSearch = useBrandStore((state) => state.setSearch);
  const setStatus = useBrandStore((state) => state.setStatus);
  const resetFilters = useBrandStore((state) => state.resetFilters);
  const { data: brands = [], isLoading } = useBrands();

  const filteredBrands = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return brands.filter((brand) => {
      const matchesSearch = !keyword || [brand.name, brand.description].some((value) => String(value || "").toLowerCase().includes(keyword));
      const matchesStatus = status === "all" || (status === "active" ? brand.status : !brand.status);
      return matchesSearch && matchesStatus;
    });
  }, [brands, search, status]);
  const pagination = usePagination(filteredBrands, 10);
  const activeCount = brands.filter((brand) => brand.status).length;

  const printRows = () => printContent({
    title: "Brand Report",
    headers: ["Name", "Description", "Status", "Created"],
    rows: filteredBrands.map((brand) => [brand.name, brand.description || "", brand.status ? "Active" : "Inactive", brand.created_at ? new Date(brand.created_at).toLocaleDateString() : ""]),
  });
  const exportPdf = async () => {
    const { exportBrandsPdf } = await import("../utils/brandExports");
    exportBrandsPdf(filteredBrands);
  };
  const exportExcel = async () => {
    const { exportBrandsExcel } = await import("../utils/brandExports");
    exportBrandsExcel(filteredBrands);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Brands"
          description="Manage product manufacturers and brand availability."
          actions={(
            <>
              <ExportButton onExport={exportPdf} disabled={!filteredBrands.length} label="Export PDF" />
              <ExportButton onExport={exportExcel} disabled={!filteredBrands.length} label="Export Excel" />
              <PrintButton onPrint={printRows} disabled={!filteredBrands.length} />
              <Link to="/brands/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="size-4" /> Add Brand
              </Link>
            </>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Total Brands" value={brands.length} icon={Tags} />
          <StatsCard title="Active Brands" value={activeCount} icon={Tags} tone="emerald" />
          <StatsCard title="Inactive Brands" value={brands.length - activeCount} icon={Tags} tone="amber" />
        </div>
        <FilterBar onReset={() => { resetFilters(); pagination.resetPage(); }} active={Boolean(search) || status !== "all"}>
          <SearchInput value={search} onChange={(value) => { setSearch(value); pagination.resetPage(); }} placeholder="Search brands..." />
          <select value={status} onChange={(event) => { setStatus(event.target.value); pagination.resetPage(); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FilterBar>
        <BrandTable
          brands={pagination.paginatedItems}
          isLoading={isLoading}
          pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }}
        />
      </div>
    </DashboardLayout>
  );
}
