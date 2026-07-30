import { supabase } from "@/lib/supabase";

const displayName = (party, fallback) => party?.name || party?.full_name || party?.supplier_name || party?.customer_name || party?.phone || fallback;

export async function getPayments() {
  const paymentResult = await supabase.from("payments").select("*").order("payment_date", { ascending: false });
  if (paymentResult.error) {
    if (["PGRST205", "42P01"].includes(paymentResult.error.code) || paymentResult.error.message?.includes("public.payments")) return [];
    throw paymentResult.error;
  }

  const payments = paymentResult.data || [];
  const customerIds = [...new Set(payments.map((payment) => payment.customer_id).filter(Boolean))];
  const supplierIds = [...new Set(payments.map((payment) => payment.supplier_id).filter(Boolean))];
  const [customerResult, supplierResult] = await Promise.all([
    customerIds.length ? supabase.from("customers").select("*").in("id", customerIds) : Promise.resolve({ data: [], error: null }),
    supplierIds.length ? supabase.from("suppliers").select("*").in("id", supplierIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (customerResult.error) throw customerResult.error;
  if (supplierResult.error) throw supplierResult.error;

  const customers = new Map((customerResult.data || []).map((customer) => [String(customer.id), { ...customer, name: displayName(customer, "Customer") }]));
  const suppliers = new Map((supplierResult.data || []).map((supplier) => [String(supplier.id), { ...supplier, name: displayName(supplier, "Supplier") }]));
  return payments.map((payment) => ({
    ...payment,
    customer: payment.customer_id ? customers.get(String(payment.customer_id)) || null : null,
    supplier: payment.supplier_id ? suppliers.get(String(payment.supplier_id)) || null : null,
  }));
}

export async function getParties(type) {
  const table = type === "customer" ? "customers" : "suppliers";
  const { data, error } = await supabase.from(table).select("*").eq("status", true).gt("current_balance", 0);
  if (error) throw error;
  return (data || []).map((party) => ({ ...party, name: displayName(party, type === "customer" ? "Customer" : "Supplier") })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function postPayment(values) {
  const { data, error } = await supabase.rpc("post_party_payment", {
    p_party_type: values.party_type,
    p_party_id: Number(values.party_id),
    p_amount: Number(values.amount),
    p_payment_method: values.payment_method,
    p_payment_date: values.payment_date,
    p_reference: values.reference || null,
    p_notes: values.notes || null,
  });
  if (error) throw error;
  return data;
}