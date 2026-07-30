import { supabase } from "@/lib/supabase";

export async function createLedgerEntry(entry) {
  const { data, error } = await supabase.from("ledger_entries").insert(entry).select().single();
  if (error) throw error;
  return data;
}

export async function getLedger(customerId) {
  const [invoiceResult, paymentResult] = await Promise.all([
    supabase
      .from("invoices")
      .select("id,invoice_no,invoice_date,grand_total,paid_amount,due_amount,payment_method,status,created_at")
      .eq("customer_id", customerId)
      .order("invoice_date", { ascending: true }),
    supabase
      .from("payments")
      .select("id,receipt_no,payment_date,amount,payment_method,reference,notes,status,created_at")
      .eq("customer_id", customerId)
      .order("payment_date", { ascending: true }),
  ]);

  if (invoiceResult.error) throw new Error(`Invoices could not be loaded: ${invoiceResult.error.message}`);
  const paymentsTableMissing = paymentResult.error && (
    paymentResult.error.code === "PGRST205" ||
    paymentResult.error.code === "42P01" ||
    paymentResult.error.message?.includes("public.payments")
  );
  if (paymentResult.error && !paymentsTableMissing) {
    throw new Error(`Payments could not be loaded: ${paymentResult.error.message}`);
  }

  const invoices = (invoiceResult.data || [])
    .filter((invoice) => invoice.status !== "cancelled")
    .map((invoice) => ({
      id: `invoice-${invoice.id}`,
      source_id: invoice.id,
      transaction_date: invoice.invoice_date,
      reference_no: invoice.invoice_no,
      description: "Sales invoice",
      reference_type: "SALE",
      debit: Number(invoice.grand_total || 0),
      credit: 0,
      status: invoice.status,
      created_at: invoice.created_at,
    }));

  const paymentRows = paymentsTableMissing
    ? (invoiceResult.data || []).filter((invoice) => Number(invoice.paid_amount || 0) > 0).map((invoice) => ({
        id: `invoice-${invoice.id}`,
        receipt_no: invoice.invoice_no,
        payment_date: invoice.invoice_date,
        amount: invoice.paid_amount,
        payment_method: invoice.payment_method || "sale payment",
        notes: `Payment received against ${invoice.invoice_no}`,
        status: invoice.status,
        created_at: invoice.created_at,
      }))
    : (paymentResult.data || []);

  const payments = paymentRows
    .filter((payment) => payment.status !== "reversed")
    .map((payment) => ({
      id: `payment-${payment.id}`,
      source_id: payment.id,
      transaction_date: payment.payment_date,
      reference_no: payment.receipt_no,
      description: payment.notes || `Payment received by ${payment.payment_method}`,
      reference_type: "PAYMENT",
      debit: 0,
      credit: Number(payment.amount || 0),
      status: payment.status,
      created_at: payment.created_at,
    }));

  return [...invoices, ...payments].sort((a, b) => {
    const dateOrder = String(a.transaction_date).localeCompare(String(b.transaction_date));
    if (dateOrder) return dateOrder;
    return String(a.created_at || "").localeCompare(String(b.created_at || ""));
  });
}
