import { useMemo, useState } from "react";

import { PageHeader, SearchInput } from "@/components/shared";
import usePagination from "@/hooks/usePagination";
import DashboardLayout from "@/layouts/DashboardLayout";
import MovementTable from "../components/MovementTable";
import { useStockMovements } from "../hooks/useStock";

export default function StockMovements() {
  const [search, setSearch] = useState("");
  const { data: movements = [], isLoading } = useStockMovements();
  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return movements.filter((row) => !keyword || [row.product?.product_name, row.product?.barcode, row.movement_type, row.notes].some((value) => String(value || "").toLowerCase().includes(keyword)));
  }, [movements, search]);
  const pagination = usePagination(filtered, 15);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Stock Movement History" description="Audit opening stock, purchases, sales, returns, adjustments, damage, and transfers." />
        <SearchInput value={search} onChange={(value) => { setSearch(value); pagination.resetPage(); }} placeholder="Search movements..." />
        <MovementTable movements={pagination.paginatedItems} isLoading={isLoading} pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }} />
      </div>
    </DashboardLayout>
  );
}
