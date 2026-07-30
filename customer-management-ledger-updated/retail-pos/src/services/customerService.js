import { supabase } from "@/lib/supabase";

export async function getCustomers(search = "") {
  let query = supabase.from("customers").select("*").order("created_at", { ascending: false });
  const keyword = search.trim();
  if (keyword) query = query.or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%,customer_code.ilike.%${keyword}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((customer) => ({
    ...customer,
    name: customer.name || customer.full_name || customer.phone || "Customer",
  }));
}

export async function getCustomerById(id) {
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
  if (error) throw error;
  return { ...data, name: data.name || data.full_name || data.phone || "Customer" };
}

export async function createCustomer(values) {
  const { data, error } = await supabase.from("customers").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(id, values) {
  const { data, error } = await supabase.from("customers").update(values).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from("customers").update({ status: false }).eq("id", id);
  if (error) throw error;
  return true;
}
