import { supabase } from "@/lib/supabase";

export async function getWalkingCustomerSales() {
  const { data, error } = await supabase
    .from("invoices")
    .select("id,invoice_no,invoice_date,subtotal,discount,tax,grand_total,paid_amount,due_amount,payment_method,status,created_at")
    .is("customer_id", null)
    .order("invoice_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
