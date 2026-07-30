import { Link, useParams } from "react-router-dom";
import { Download, Printer, X } from "lucide-react";

import { LoadingSkeleton, PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useInvoice } from "../hooks/usePos";

export default function ReceiptPage() {
  const { id } = useParams();
  const { data: invoice, isLoading, isError, error, refetch } = useInvoice(id);
  if (isLoading) return <DashboardLayout><LoadingSkeleton /></DashboardLayout>;
  if (isError || !invoice) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:bg-red-950/20">
          <h1 className="text-lg font-semibold">Receipt could not be loaded</h1>
          <p className="mt-2 break-words text-sm">{error?.message || "The completed invoice was not found."}</p>
          <div className="mt-4 flex justify-center gap-3">
            <button type="button" onClick={() => refetch()} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
            <a href="/pos" className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold">Back to POS</a>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  const download = async () => (await import("../utils/receipt")).downloadReceipt(invoice);
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-md space-y-5">
        <PageHeader title="Sale Receipt" actions={<><Link to="/pos" className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"><X className="size-4" /> Close</Link><button type="button" onClick={download} className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm"><Download className="size-4" /> PDF</button><button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm text-white"><Printer className="size-4" /> Print</button></>} />
        <article className="rounded-xl border bg-white p-6 font-mono text-sm shadow-sm dark:bg-slate-900">
          <div className="text-center"><h2 className="text-lg font-bold">RETAIL POS</h2><p>{invoice.invoice_no}</p><p>{invoice.invoice_date}</p></div>
          <div className="my-5 border-y py-3"><p>Customer: {invoice.customer?.name || "Walking Customer"}</p><p>Payment: {invoice.payment_method}</p></div>
          <div className="space-y-3">{(invoice.items || []).map((item) => <div key={item.id} className="flex justify-between"><span>{item.product?.product_name}<br /><small>{item.quantity} × {Number(item.sale_price).toFixed(2)}</small></span><span>{Number(item.total).toFixed(2)}</span></div>)}</div>
          <div className="mt-5 space-y-1 border-t pt-3"><p className="flex justify-between"><span>Subtotal</span><span>{Number(invoice.subtotal).toFixed(2)}</span></p><p className="flex justify-between"><span>Discount</span><span>{Number(invoice.discount).toFixed(2)}</span></p><p className="flex justify-between"><span>Tax</span><span>{Number(invoice.tax).toFixed(2)}</span></p><p className="flex justify-between text-lg font-bold"><span>Total</span><span>{Number(invoice.grand_total).toFixed(2)}</span></p><p className="flex justify-between"><span>Paid</span><span>{Number(invoice.paid_amount).toFixed(2)}</span></p><p className="flex justify-between"><span>Due</span><span>{Number(invoice.due_amount).toFixed(2)}</span></p></div>
          <p className="mt-6 text-center">Thank you for your purchase</p>
        </article>
      </div>
    </DashboardLayout>
  );
}
