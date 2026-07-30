import { supabase } from "@/lib/supabase";

export async function getSales() {
  const { data, error } = await supabase.from("invoices").select("*, customer:customers(id,name,phone), items:invoice_items(*, product:products(id,product_name,barcode))").order("invoice_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getSale(id) {
  const { data, error } = await supabase.from("invoices").select("*, customer:customers(id,name,phone), items:invoice_items(*, product:products(id,product_name,barcode))").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function getSaleLedger(id) {
  const { data, error } = await supabase.from("ledger_entries").select("*, account:accounts(id,account_name,account_type)").in("reference_type", ["SALE", "SALE_CANCEL"]).eq("reference_id", id).order("created_at");
  if (error) throw error;
  return data || [];
}

export async function cancelSale({ invoiceId, warehouseId, reason }) {
  const { error } = await supabase.rpc("cancel_sale", { p_invoice_id: Number(invoiceId), p_warehouse_id: Number(warehouseId), p_reason: reason });
  if (error) throw error;
}

export async function returnSale({ invoiceId, warehouseId, items, refundMethod, reason }) {
  const { data, error } = await supabase.rpc("return_sale", { p_invoice_id: Number(invoiceId), p_warehouse_id: Number(warehouseId), p_items: items, p_refund_method: refundMethod, p_reason: reason });
  if (error) throw error;
  return data;
}

export async function getSalesReturns() {
  const { data, error } = await supabase.from("sales_returns").select("*,invoice:invoices(id,invoice_no),customer:customers(id,name),warehouse:warehouses(id,name),items:sales_return_items(*,product:products(id,product_name))").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

