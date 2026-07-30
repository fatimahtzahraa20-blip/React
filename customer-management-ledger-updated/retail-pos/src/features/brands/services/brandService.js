import { supabase } from "@/lib/supabase";

const TABLE = "brands";

export async function getBrands() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getBrandById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createBrand(values) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBrand(id, values) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateBrand(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: false })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
