import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Ruler } from "lucide-react";

import { ExportButton, FilterBar, PageHeader, PrintButton, SearchInput, StatsCard } from "@/components/shared";
import usePagination from "@/hooks/usePagination";
import DashboardLayout from "@/layouts/DashboardLayout";
import printContent from "@/utils/printContent";
import UnitTable from "../components/UnitTable";
import { useUnits } from "../hooks/useUnits";
import useUnitStore from "../store/unitStore";

export default function UnitList() {
  const search = useUnitStore((state) => state.search);
  const status = useUnitStore((state) => state.status);
  const setSearch = useUnitStore((state) => state.setSearch);
  const setStatus = useUnitStore((state) => state.setStatus);
  const resetFilters = useUnitStore((state) => state.resetFilters);
  const { data: units = [], isLoading } = useUnits();

  const filteredUnits = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return units.filter((unit) => {
      const matchesSearch = !keyword || [unit.name, unit.short_name].some((value) => String(value || "").toLowerCase().includes(keyword));
      const matchesStatus = status === "all" || (status === "active" ? unit.status : !unit.status);
      return matchesSearch && matchesStatus;
    });
  }, [units, search, status]);
  const pagination = usePagination(filteredUnits, 10);
  const activeCount = units.filter((unit) => unit.status).length;

  const printRows = () => printContent({
    title: "Unit Report",
    headers: ["Name", "Short Name", "Status", "Created"],
    rows: filteredUnits.map((unit) => [unit.name, unit.short_name, unit.status ? "Active" : "Inactive", unit.created_at ? new Date(unit.created_at).toLocaleDateString() : ""]),
  });
  const exportPdf = async () => {
    const { exportUnitsPdf } = await import("../utils/unitExports");
    exportUnitsPdf(filteredUnits);
  };
  const exportExcel = async () => {
    const { exportUnitsExcel } = await import("../utils/unitExports");
    exportUnitsExcel(filteredUnits);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Units"
          description="Manage measurement units used by products and inventory."
          actions={(
            <>
              <ExportButton onExport={exportPdf} disabled={!filteredUnits.length} label="Export PDF" />
              <ExportButton onExport={exportExcel} disabled={!filteredUnits.length} label="Export Excel" />
              <PrintButton onPrint={printRows} disabled={!filteredUnits.length} />
              <Link to="/units/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="size-4" /> Add Unit
              </Link>
            </>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Total Units" value={units.length} icon={Ruler} />
          <StatsCard title="Active Units" value={activeCount} icon={Ruler} tone="emerald" />
          <StatsCard title="Inactive Units" value={units.length - activeCount} icon={Ruler} tone="amber" />
        </div>
        <FilterBar onReset={() => { resetFilters(); pagination.resetPage(); }} active={Boolean(search) || status !== "all"}>
          <SearchInput value={search} onChange={(value) => { setSearch(value); pagination.resetPage(); }} placeholder="Search units..." />
          <select value={status} onChange={(event) => { setStatus(event.target.value); pagination.resetPage(); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FilterBar>
        <UnitTable
          units={pagination.paginatedItems}
          isLoading={isLoading}
          pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }}
        />
      </div>
    </DashboardLayout>
  );
}
