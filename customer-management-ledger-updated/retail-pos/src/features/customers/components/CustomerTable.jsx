import { DataTable, EmptyState, StatusBadge } from "@/components/shared";
import CustomerActions from "./CustomerActions";

const columns = [
  { key: "customer_code", header: "Code" },
  { key: "name", header: "Customer", render: (customer) => <span className="font-medium">{customer.name}</span> },
  { key: "phone", header: "Phone" },
  { key: "current_balance", header: "Balance", render: (customer) => Number(customer.current_balance || 0).toLocaleString(undefined, { style: "currency", currency: "USD" }) },
  { key: "status", header: "Status", render: (customer) => <StatusBadge status={customer.status} /> },
  { key: "actions", header: "Actions", headerClassName: "px-4 py-3 text-center font-semibold", cellClassName: "px-4 py-3", render: (customer) => <div className="flex justify-center"><CustomerActions customer={customer} /></div> },
];

export default function CustomerTable({ customers, isLoading, pagination }) {
  return (
    <DataTable
      columns={columns}
      data={customers}
      isLoading={isLoading}
      pagination={pagination}
      emptyState={<EmptyState title="No customers found" description="Try a different search or add your first customer." />}
    />
  );
}
