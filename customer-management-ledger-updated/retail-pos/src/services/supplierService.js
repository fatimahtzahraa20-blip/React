import { supabase } from "@/lib/supabase";

export async function getSuppliers() {
  const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getSupplierById(id) {
  const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createSupplier(values) {
  const { data, error } = await supabase.from("suppliers").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateSupplier(id, values) {
  const { data, error } = await supabase.from("suppliers").update(values).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSupplier(id) {
  const { error } = await supabase.from("suppliers").update({ status: false }).eq("id", id);
  if (error) throw error;
  return true;
}
