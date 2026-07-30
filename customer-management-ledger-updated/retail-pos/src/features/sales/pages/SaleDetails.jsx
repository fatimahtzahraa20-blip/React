import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { DataTable, LoadingSkeleton, Modal, PageHeader, StatusBadge } from "@/components/shared";
import { useWarehouses } from "@/features/stock/hooks/useStock";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useCancelSale, useReturnSale, useSale, useSaleLedger } from "../hooks/useSales";

export default function SaleDetails() {
  const { id } = useParams();
  const [action, setAction] = useState(null);
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");
  const [quantities, setQuantities] = useState({});
  const { data: sale, isLoading } = useSale(id);
  const { data: ledger = [] } = useSaleLedger(id);
  const { data: warehouses = [] } = useWarehouses();
  const cancel = useCancelSale({ onSuccess: () => { toast.success("Sale cancelled"); setAction(null); }, onError: (e) => toast.error(e.message) });
  const returnMutation = useReturnSale({ onSuccess: () => { toast.success("Return posted"); setAction(null); }, onError: (e) => toast.error(e.message) });
  if (isLoading) return <DashboardLayout><LoadingSkeleton /></DashboardLayout>;
  const itemColumns = [{ key: "product", header: "Product", render: (r) => r.product?.product_name }, { key: "quantity", header: "Qty" }, { key: "sale_price", header: "Price" }, { key: "discount", header: "Discount" }, { key: "total", header: "Total" }];
  const ledgerColumns = [{ key: "account", header: "Account", render: (r) => r.account?.account_name }, { key: "description", header: "Description" }, { key: "debit", header: "Debit" }, { key: "credit", header: "Credit" }];
  const postReturn = () => returnMutation.mutate({ invoiceId: id, warehouseId, refundMethod, reason, items: sale.items.filter((item) => Number(quantities[item.id]) > 0).map((item) => ({ invoice_item_id: item.id, quantity: Number(quantities[item.id]) })) });
  return <DashboardLayout><div className="space-y-6"><PageHeader title={sale.invoice_no} description={`${sale.customer?.name || "Walking Customer"} · ${sale.invoice_date}`} actions={<><StatusBadge status={sale.status === "completed" ? "success" : "warning"} label={sale.status} />{sale.status === "completed" ? <><button onClick={() => setAction("return")} className="h-10 rounded-lg border px-4 text-sm">Return</button><button onClick={() => setAction("cancel")} className="h-10 rounded-lg bg-red-600 px-4 text-sm text-white">Cancel Sale</button></> : null}</>} /><DataTable columns={itemColumns} data={sale.items} /><section><h2 className="mb-3 text-lg font-semibold">Sales Ledger</h2><DataTable columns={ledgerColumns} data={ledger} /></section></div><Modal open={Boolean(action)} onClose={() => setAction(null)} title={action === "cancel" ? "Cancel Sale" : "Return Items"}>{action === "return" ? <div className="space-y-3">{sale.items.map((item) => <label key={item.id} className="flex items-center justify-between"><span>{item.product?.product_name} (max {item.quantity})</span><input type="number" min="0" max={item.quantity} value={quantities[item.id] || 0} onChange={(e) => setQuantities({ ...quantities, [item.id]: e.target.value })} className="h-9 w-24 rounded border px-2" /></label>)}</div> : null}<div className="mt-4 space-y-3"><select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="h-10 w-full rounded border px-3"><option value="">Select warehouse</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>{action === "return" ? <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} className="h-10 w-full rounded border px-3"><option value="cash">Cash refund</option><option value="card">Card refund</option><option value="credit">Customer credit</option></select> : null}<textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="w-full rounded border p-3" /><button onClick={() => action === "cancel" ? cancel.mutate({ invoiceId: id, warehouseId, reason }) : postReturn()} className="h-10 w-full rounded bg-red-600 text-white">Confirm</button></div></Modal></DashboardLayout>;
}
