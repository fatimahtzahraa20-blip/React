import { supabase } from "@/lib/supabase";

const TABLE = "units";

export async function getUnits() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getUnitById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createUnit(values) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUnit(id, values) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateUnit(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: false })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
