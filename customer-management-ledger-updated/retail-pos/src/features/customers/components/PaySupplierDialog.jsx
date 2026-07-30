import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { FormInput, FormSelect, FormTextarea, Modal } from "@/components/shared";
import { postPayment } from "@/features/payments/services/paymentService";

export default function PaySupplierDialog({ supplier }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", payment_method: "cash", payment_date: new Date().toISOString().slice(0, 10), reference: "", notes: "" });
  const client = useQueryClient();
  const outstanding = Number(supplier?.current_balance || 0);
  const mutation = useMutation({ mutationFn: () => postPayment({ ...form, party_type: "supplier", party_id: supplier.id }), onSuccess: () => { client.invalidateQueries({ queryKey: ["supplier-ledger", String(supplier.id)] }); client.invalidateQueries({ queryKey: ["suppliers"] }); toast.success("Supplier payment posted"); setOpen(false); setForm((value) => ({ ...value, amount: "", reference: "", notes: "" })); }, onError: (error) => toast.error(error.message) });
  const submit = (event) => { event.preventDefault(); const amount = Number(form.amount); if (!amount || amount <= 0) return toast.error("Enter a valid amount"); if (amount > outstanding) return toast.error("Payment cannot exceed the outstanding balance"); mutation.mutate(); };
  return <><button type="button" onClick={() => setOpen(true)} disabled={!supplier || outstanding <= 0} className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Send className="size-4" /> Pay Supplier</button><Modal open={open} onClose={() => setOpen(false)} title="Pay supplier"><form onSubmit={submit} className="space-y-4"><div className="rounded-md border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40"><p className="font-semibold">{supplier?.name}</p><p className="mt-1 text-xs text-slate-500">Outstanding: Rs {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div><FormInput label="Amount" type="number" min="0.01" max={outstanding} step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /><FormSelect label="Payment method" options={[{ value: "cash", label: "Cash" }, { value: "bank", label: "Bank" }]} value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} /><FormInput label="Payment date" type="date" required value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} /><FormInput label="Reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /><FormTextarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /><button disabled={mutation.isPending} className="h-11 w-full rounded-md bg-emerald-600 font-semibold text-white disabled:opacity-60">{mutation.isPending ? "Posting payment..." : "Post supplier payment"}</button></form></Modal></>;
}
