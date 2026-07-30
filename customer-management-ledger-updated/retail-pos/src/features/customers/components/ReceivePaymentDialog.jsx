import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Banknote } from "lucide-react";
import toast from "react-hot-toast";
import { FormInput, FormSelect, FormTextarea, Modal } from "@/components/shared";
import { postPayment } from "@/features/payments/services/paymentService";

export default function ReceivePaymentDialog({ customer }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", payment_method: "cash", payment_date: new Date().toISOString().slice(0, 10), reference: "", notes: "" });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => postPayment({ ...form, party_type: "customer", party_id: customer.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-ledger", String(customer.id)] });
      queryClient.invalidateQueries({ queryKey: ["customer", String(customer.id)] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Payment received and ledger updated");
      setOpen(false);
      setForm((current) => ({ ...current, amount: "", reference: "", notes: "" }));
    },
    onError: (error) => toast.error(error.message),
  });
  const outstanding = Number(customer?.current_balance || 0);
  const submit = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return toast.error("Enter a valid payment amount");
    if (amount > outstanding) return toast.error("Payment cannot exceed the outstanding balance");
    mutation.mutate();
  };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={!customer || outstanding <= 0} className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Banknote className="size-4" /> Receive Payment</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Receive customer payment">
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-md border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40"><p className="text-sm font-semibold text-slate-900 dark:text-white">{customer?.name}</p><p className="mt-1 text-xs text-slate-500">Outstanding: Rs {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          <FormInput label="Amount" type="number" min="0.01" max={outstanding} step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <FormSelect label="Payment method" options={[{ value: "cash", label: "Cash" }, { value: "bank", label: "Bank" }]} value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
          <FormInput label="Payment date" type="date" required value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
          <FormInput label="Reference" placeholder="Cheque, transfer, or receipt reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          <FormTextarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" disabled={mutation.isPending} className="h-11 w-full rounded-md bg-emerald-600 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{mutation.isPending ? "Posting payment..." : "Post payment"}</button>
        </form>
      </Modal>
    </>
  );
}
