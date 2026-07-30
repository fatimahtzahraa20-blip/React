import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ExportButton, PrintButton, StatusBadge } from "@/components/shared";
import ReceivePaymentDialog from "./ReceivePaymentDialog";

export default function LedgerHeader({ customer, onExport, onPrint, disabled }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div><Link to="/customers" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="size-4" /> Back to customers</Link><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{customer?.name || "Customer Statement"}</h1>{customer ? <StatusBadge status={customer.status} /> : null}</div><p className="mt-2 text-sm text-slate-500">{customer?.customer_code ? `${customer.customer_code} | ` : ""}{customer?.phone || "Complete invoice and payment history"}</p></div>
      <div className="flex flex-wrap items-center gap-2">{customer ? <ReceivePaymentDialog customer={customer} /> : null}<ExportButton onExport={onExport} disabled={disabled} label="Export CSV" /><PrintButton onPrint={onPrint} disabled={disabled} /></div>
    </div>
  );
}
