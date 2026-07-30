import { DataTable, EmptyState, StatusBadge } from "@/components/shared";
import SupplierActions from "./SupplierActions";

const columns = [
  { key: "supplier_code", header: "Code" },
  { key: "name", header: "Supplier", render: (supplier) => <span className="font-medium">{supplier.name}</span> },
  { key: "phone", header: "Phone" },
  { key: "current_balance", header: "Balance", render: (supplier) => Number(supplier.current_balance || 0).toLocaleString(undefined, { style: "currency", currency: "USD" }) },
  { key: "status", header: "Status", render: (supplier) => <StatusBadge status={supplier.status} /> },
  { key: "actions", header: "Actions", headerClassName: "px-4 py-3 text-center font-semibold", cellClassName: "px-4 py-3", render: (supplier) => <div className="flex justify-center"><SupplierActions supplier={supplier} /></div> },
];

export default function SupplierTable({ suppliers, isLoading, pagination }) {
  return (
    <DataTable
      columns={columns}
      data={suppliers}
      isLoading={isLoading}
      pagination={pagination}
      emptyState={<EmptyState title="No suppliers found" description="Try a different search or add your first supplier." />}
    />
  );
}
