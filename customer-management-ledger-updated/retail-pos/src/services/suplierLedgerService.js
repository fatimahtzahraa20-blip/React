import { supabase } from "@/lib/supabase";

export async function getSupplierLedger(supplierId) {
  const [supplierResult, purchasesResult, paymentsResult] = await Promise.all([
    supabase.from("suppliers").select("*").eq("id", supplierId).single(),
    supabase.from("purchases").select("*").eq("supplier_id", supplierId).order("purchase_date", { ascending: true }),
    supabase.from("payments").select("*").eq("supplier_id", supplierId).order("payment_date", { ascending: true }),
  ]);
  if (supplierResult.error) throw new Error(`Supplier could not be loaded: ${supplierResult.error.message}`);
  if (purchasesResult.error) throw new Error(`Purchases could not be loaded: ${purchasesResult.error.message}`);
  if (paymentsResult.error) throw new Error(`Payments could not be loaded: ${paymentsResult.error.message}`);

  const purchases = (purchasesResult.data || []).filter((purchase) => purchase.status !== "cancelled").map((purchase) => ({
    id: `purchase-${purchase.id}`,
    source_id: purchase.id,
    transaction_date: purchase.purchase_date,
    reference_no: purchase.purchase_no || purchase.reference_no || `PUR-${purchase.id}`,
    description: "Purchase invoice",
    reference_type: "PURCHASE",
    debit: 0,
    credit: Number(purchase.grand_total || purchase.total_amount || 0),
    created_at: purchase.created_at,
  }));
  const payments = (paymentsResult.data || []).filter((payment) => payment.status !== "reversed").map((payment) => ({
    id: `payment-${payment.id}`,
    source_id: payment.id,
    transaction_date: payment.payment_date,
    reference_no: payment.receipt_no,
    description: payment.notes || `Supplier payment by ${payment.payment_method}`,
    reference_type: "PAYMENT",
    debit: Number(payment.amount || 0),
    credit: 0,
    created_at: payment.created_at,
  }));
  const ledger = [...purchases, ...payments].sort((a, b) => String(a.transaction_date).localeCompare(String(b.transaction_date)) || String(a.created_at || "").localeCompare(String(b.created_at || "")));
  return { supplier: supplierResult.data, ledger };
}
