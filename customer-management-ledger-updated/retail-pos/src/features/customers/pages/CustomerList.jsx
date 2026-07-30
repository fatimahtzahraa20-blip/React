import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { ExportButton, PageHeader, PrintButton } from "@/components/shared";
import useCustomers from "@/hooks/useCustomers";
import usePagination from "@/hooks/usePagination";
import exportToCsv from "@/utils/exportToCsv";
import printContent from "@/utils/printContent";
import CustomerSearch from "../components/CustomerSearch";
import CustomerTable from "../components/CustomerTable";

export default function CustomerList() {
  const [search, setSearch] = useState("");
  const { data: customers = [], isLoading } = useCustomers(search);
  const pagination = usePagination(customers, 10);

  const exportRows = () => exportToCsv({
    rows: customers,
    fileName: "customers.csv",
    columns: [
      { label: "Code", value: "customer_code" },
      { label: "Name", value: "name" },
      { label: "Phone", value: "phone" },
      { label: "Balance", value: "current_balance" },
      { label: "Status", value: (row) => row.status ? "Active" : "Inactive" },
    ],
  });

  const printRows = () => printContent({
    title: "Customers",
    headers: ["Code", "Name", "Phone", "Balance", "Status"],
    rows: customers.map((customer) => [customer.customer_code, customer.name, customer.phone, customer.current_balance || 0, customer.status ? "Active" : "Inactive"]),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Customers"
          description="Manage customer profiles, balances, and account status."
          actions={(
            <>
              <ExportButton onExport={exportRows} disabled={!customers.length} label="Export CSV" />
              <PrintButton onPrint={printRows} disabled={!customers.length} />
              <Link to="/customer-ledger" className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold hover:border-blue-400 hover:text-blue-600"><BookOpen className="size-4" /> Customer Ledger</Link>
              <Link to="/customers/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="size-4" /> Add Customer
              </Link>
            </>
          )}
        />
        <div className="flex items-center justify-between gap-4">
          <CustomerSearch value={search} onChange={(value) => { setSearch(value); pagination.resetPage(); }} />
        </div>
        <CustomerTable
          customers={pagination.paginatedItems}
          isLoading={isLoading}
          pagination={{ page: pagination.page, pageSize: pagination.pageSize, total: pagination.total, onPageChange: pagination.setPage }}
        />
      </div>
    </DashboardLayout>
  );
}
