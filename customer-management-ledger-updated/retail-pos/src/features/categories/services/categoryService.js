import { supabase } from "@/lib/supabase";

const TABLE = "categories";

export async function getCategories() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getCategoryById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCategory(values) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, values) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateCategory(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: false })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
