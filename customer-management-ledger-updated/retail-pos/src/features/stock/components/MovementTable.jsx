import dayjs from "dayjs";
import { DataTable, EmptyState, StatusBadge } from "@/components/shared";

const columns = [
  { key: "created_at", header: "Date", render: (row) => dayjs(row.created_at).format("DD MMM YYYY, hh:mm A") },
  { key: "product", header: "Product", render: (row) => row.product?.product_name || "—" },
  { key: "warehouse", header: "Warehouse", render: (row) => row.warehouse?.name || "—" },
  { key: "movement_type", header: "Type", render: (row) => <StatusBadge status={Number(row.quantity) < 0 ? "danger" : "success"} label={String(row.movement_type).replaceAll("_", " ")} /> },
  { key: "quantity", header: "Change", render: (row) => <span className={Number(row.quantity) < 0 ? "font-bold text-red-600" : "font-bold text-emerald-600"}>{Number(row.quantity) > 0 ? "+" : ""}{row.quantity}</span> },
  { key: "balance_after", header: "Balance" },
  { key: "notes", header: "Notes" },
];

export default function MovementTable({ movements, isLoading, pagination }) {
  return <DataTable columns={columns} data={movements} isLoading={isLoading} pagination={pagination} emptyState={<EmptyState title="No stock movements" description="Inventory movement history will appear here." />} />;
}
