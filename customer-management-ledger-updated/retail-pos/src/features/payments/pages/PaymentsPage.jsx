import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { DataTable, FormInput, FormSelect, Modal, PageHeader, StatsCard } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useParties, usePayments, usePostPayment } from "../hooks/usePayments";

const PAYMENT_CATEGORIES = [
  { value: "all", label: "All payment categories" },
  { value: "customer", label: "Customer Receipts" },
  { value: "supplier", label: "Supplier Payments" },
];

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [form, setForm] = useState({ party_type: "customer", party_id: "", amount: 0, payment_method: "cash", payment_date: new Date().toISOString().slice(0, 10), reference: "", notes: "" });
  const { data: payments = [], isLoading, isError, error, refetch } = usePayments();
  const { data: parties = [] } = useParties(form.party_type);
  const post = usePostPayment({
    onSuccess: () => {
      toast.success("Payment posted");
      setOpen(false);
      setForm((current) => ({ ...current, party_id: "", amount: 0, reference: "", notes: "" }));
    },
    onError: (postError) => toast.error(postError.message),
  });
  const filtered = useMemo(() => category === "all" ? payments : payments.filter((payment) => payment.party_type === category), [payments, category]);
  const columns = [
    { key: "receipt_no", header: "Receipt" },
    { key: "payment_date", header: "Date" },
    { key: "party", header: "Party", render: (payment) => payment.customer?.name || payment.supplier?.name || "-" },
    { key: "party_type", header: "Category", render: (payment) => payment.party_type === "customer" ? "Customer Receipt" : "Supplier Payment" },
    { key: "amount", header: "Amount", render: (payment) => Number(payment.amount).toFixed(2) },
    { key: "payment_method", header: "Method", render: (payment) => <span className="capitalize">{payment.payment_method}</span> },
    { key: "status", header: "Status", render: (payment) => <span className="capitalize">{payment.status}</span> },
  ];

  return <DashboardLayout><div className="space-y-6">
    <PageHeader title="Payments" description="Customer receipts and supplier settlements, categorized by transaction purpose." actions={<button onClick={() => setOpen(true)} className="h-10 rounded bg-blue-600 px-4 text-white">New Payment</button>} />
    <div className="grid gap-4 sm:grid-cols-3">
      <StatsCard title="All Payments" value={payments.length} />
      <StatsCard title="Customer Receipts" value={payments.filter((payment) => payment.party_type === "customer").reduce((sum, payment) => sum + Number(payment.amount), 0).toFixed(2)} tone="emerald" />
      <StatsCard title="Supplier Payments" value={payments.filter((payment) => payment.party_type === "supplier").reduce((sum, payment) => sum + Number(payment.amount), 0).toFixed(2)} tone="amber" />
    </div>
    <div className="flex justify-end"><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900">{PAYMENT_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
    {isError ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">{error.message}<button type="button" onClick={() => refetch()} className="ml-3 font-semibold underline">Retry</button></div> : <DataTable columns={columns} data={filtered} isLoading={isLoading} />}
  </div>
  <Modal open={open} onClose={() => setOpen(false)} title="Post Payment">
    <div className="space-y-4">
      <FormSelect label="Payment category" options={[{ value: "customer", label: "Customer Receipt" }, { value: "supplier", label: "Supplier Payment" }]} value={form.party_type} onChange={(event) => setForm({ ...form, party_type: event.target.value, party_id: "" })} />
      <FormSelect label={form.party_type === "customer" ? "Customer" : "Supplier"} options={parties.map((party) => ({ value: String(party.id), label: `${party.name} | Outstanding ${Number(party.current_balance).toFixed(2)}` }))} value={form.party_id} onChange={(event) => setForm({ ...form, party_id: event.target.value })} />
      <FormInput label="Amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
      <FormSelect label="Payment method" options={[{ value: "cash", label: "Cash" }, { value: "bank", label: "Bank" }]} value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })} />
      <FormInput label="Date" type="date" value={form.payment_date} onChange={(event) => setForm({ ...form, payment_date: event.target.value })} />
      <FormInput label="Reference" value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} />
      <FormInput label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      <button disabled={post.isPending || !form.party_id || Number(form.amount) <= 0} onClick={() => post.mutate(form)} className="h-10 w-full rounded bg-blue-600 text-white disabled:opacity-50">{post.isPending ? "Posting..." : "Post Payment"}</button>
    </div>
  </Modal></DashboardLayout>;
}