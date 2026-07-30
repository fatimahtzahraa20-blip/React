import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { DataTable, EmptyState, StatusBadge } from "@/components/shared";

const columns = [
  { key: "invoice_no", header: "Invoice", render: (sale) => <span className="font-semibold">{sale.invoice_no}</span> },
  { key: "invoice_date", header: "Date", render: (sale) => dayjs(sale.invoice_date).format("DD MMM YYYY") },
  { key: "customer", header: "Customer", render: (sale) => sale.customer?.name || "Walking Customer" },
  { key: "grand_total", header: "Total", render: (sale) => Number(sale.grand_total).toFixed(2) },
  { key: "paid_amount", header: "Paid", render: (sale) => Number(sale.paid_amount).toFixed(2) },
  { key: "due_amount", header: "Due", render: (sale) => Number(sale.due_amount).toFixed(2) },
  { key: "status", header: "Status", render: (sale) => <StatusBadge status={sale.status === "completed" ? "success" : sale.status === "cancelled" ? "danger" : "warning"} label={sale.status} /> },
  { key: "actions", header: "Actions", render: (sale) => <Link to={`/sales/${sale.id}`} className="inline-flex rounded-lg p-2 hover:bg-slate-100"><Eye className="size-4" /></Link> },
];
export default function SalesTable({ sales, isLoading, pagination }) {
  return <DataTable columns={columns} data={sales} isLoading={isLoading} pagination={pagination} emptyState={<EmptyState title="No sales found" description="Completed POS invoices will appear here." />} />;
}
