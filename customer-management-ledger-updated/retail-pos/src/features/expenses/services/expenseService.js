import { supabase } from "@/lib/supabase";

export async function getExpenseCategories() {
  const { data, error } = await supabase.from("expense_categories").select("*").order("name");
  if (error) throw error;
  return data || [];
}
export async function createExpenseCategory(values) {
  const { data, error } = await supabase.from("expense_categories").insert(values).select().single();
  if (error) throw error;
  return data;
}
export async function getExpenses() {
  const { data, error } = await supabase.from("expenses").select("*, category:expense_categories(id,name)").order("expense_date", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function uploadReceipt(file) {
  if (!file) return null;
  const { data: user } = await supabase.auth.getUser();
  const path = `${user.user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("expense-receipts").upload(path, file);
  if (error) throw error;
  return path;
}
export async function postExpense({ values, receipt }) {
  const receiptUrl = await uploadReceipt(receipt);
  const { data, error } = await supabase.rpc("post_expense", { p_category_id: Number(values.category_id), p_expense_date: values.expense_date, p_amount: Number(values.amount), p_payment_method: values.payment_method, p_description: values.description, p_receipt_url: receiptUrl });
  if (error) throw error;
  return data;
}
export async function reverseExpense({ id, reason }) {
  const { error } = await supabase.rpc("reverse_expense", { p_expense_id: Number(id), p_reason: reason });
  if (error) throw error;
}
