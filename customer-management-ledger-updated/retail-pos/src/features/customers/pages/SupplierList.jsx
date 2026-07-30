import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { ExportButton, PageHeader, PrintButton } from "@/components/shared";
import usePagination from "@/hooks/usePagination";
import useSuppliers from "@/hooks/useSuppliers";
import exportToCsv from "@/utils/exportToCsv";
import printContent from "@/utils/printContent";
import SupplierTable from "../components/SupplierTable";
import SupplierSearch from "../components/SupplierSearch";

export default function SupplierList() {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useSuppliers();
  const suppliers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter((supplier) => [supplier.name, supplier.phone, supplier.supplier_code].some((value) => String(value || "").toLowerCase().includes(keyword)));
  }, [data, search]);
  const pagination = usePagination(suppliers, 10);

  const exportRows = () => exportToCsv({
    rows: suppliers,
    fileName: "suppliers.csv",
    columns: [
      { label: "Code", value: "supplier_code" },
      { label: "Name", value: "name" },
      { label: "Phone", value: "phone" },
      { label: "Balance", value: "current_balance" },
      { label: "Status", value: (row) => row.status ? "Active" : "Inactive" },
    ],
  });

  const printRows = () => printContent({
    title: "Suppliers",
    headers: ["Code", "Name", "Phone", "Balance", "Status"],
    rows: suppliers.map((supplier) => [supplier.supplier_code, supplier.name, supplier.phone, supplier.current_balance || 0, supplier.status ? "Active" : "Inactive"]),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Suppliers"
          description="Manage supplier profiles, balances, and account status."
          actions={(
            <>
              <ExportButton onExport={exportRows} disabled={!suppliers.length} label="Export CSV" />
              <PrintButton onPrint={printRows} disabled={!suppliers.length} />
              <Link to="/suppliers/add" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="size-4" /> Add Supplier
              </Link>
            </>
          )}
        />
        <div className="flex items-center justify-between gap-4">
          <SupplierSearch value={search} onChange={(value) => { setSearch(value); pagination.resetPage(); }} />
        </div>
        <SupplierTable
          suppliers={pagination.paginatedItems}
          isLoading={isLoading}
          pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }}
        />
      </div>
    </DashboardLayout>
  );
}
