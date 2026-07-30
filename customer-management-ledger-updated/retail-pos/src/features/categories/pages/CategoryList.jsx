import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FolderTree, Plus } from "lucide-react";

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
import CategoryTable from "../components/CategoryTable";
import { useCategories } from "../hooks/useCategories";
import useCategoryStore from "../store/categoryStore";

export default function CategoryList() {
  const search = useCategoryStore((state) => state.search);
  const status = useCategoryStore((state) => state.status);
  const setSearch = useCategoryStore((state) => state.setSearch);
  const setStatus = useCategoryStore((state) => state.setStatus);
  const resetFilters = useCategoryStore((state) => state.resetFilters);
  const { data: categories = [], isLoading } = useCategories();

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return categories.filter((category) => {
      const matchesSearch = !keyword || [category.name, category.description].some((value) => String(value || "").toLowerCase().includes(keyword));
      const matchesStatus = status === "all" || (status === "active" ? category.status : !category.status);
      return matchesSearch && matchesStatus;
    });
  }, [categories, search, status]);
  const pagination = usePagination(filteredCategories, 10);
  const activeCount = categories.filter((category) => category.status).length;

  const printRows = () => printContent({
    title: "Category Report",
    headers: ["Name", "Description", "Status", "Created"],
    rows: filteredCategories.map((category) => [category.name, category.description || "", category.status ? "Active" : "Inactive", category.created_at ? new Date(category.created_at).toLocaleDateString() : ""]),
  });
  const exportPdf = async () => {
    const { exportCategoriesPdf } = await import("../utils/categoryExports");
    exportCategoriesPdf(filteredCategories);
  };
  const exportExcel = async () => {
    const { exportCategoriesExcel } = await import("../utils/categoryExports");
    exportCategoriesExcel(filteredCategories);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Categories"
          description="Organize products into reusable inventory categories."
          actions={(
            <>
              <ExportButton onExport={exportPdf} disabled={!filteredCategories.length} label="Export PDF" />
              <ExportButton onExport={exportExcel} disabled={!filteredCategories.length} label="Export Excel" />
              <PrintButton onPrint={printRows} disabled={!filteredCategories.length} />
              <Link to="/categories/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="size-4" /> Add Category
              </Link>
            </>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Total Categories" value={categories.length} icon={FolderTree} />
          <StatsCard title="Active Categories" value={activeCount} icon={FolderTree} tone="emerald" />
          <StatsCard title="Inactive Categories" value={categories.length - activeCount} icon={FolderTree} tone="amber" />
        </div>
        <FilterBar onReset={() => { resetFilters(); pagination.resetPage(); }} active={Boolean(search) || status !== "all"}>
          <SearchInput value={search} onChange={(value) => { setSearch(value); pagination.resetPage(); }} placeholder="Search categories..." />
          <select value={status} onChange={(event) => { setStatus(event.target.value); pagination.resetPage(); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FilterBar>
        <CategoryTable
          categories={pagination.paginatedItems}
          isLoading={isLoading}
          pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }}
        />
      </div>
    </DashboardLayout>
  );
}
