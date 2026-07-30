import { supabase } from "@/lib/supabase";

export async function globalSearch({ query, types, from, to, limit = 100 }) {
  if (!query?.trim()) return [];
  const { data, error } = await supabase.rpc("global_search", {
    p_query: query.trim(),
    p_types: types?.length ? types : null,
    p_from: from || null,
    p_to: to || null,
    p_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

export async function getSavedFilters(module = "global-search") {
  const { data, error } = await supabase
    .from("saved_filters")
    .select("*")
    .eq("module", module)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveFilter({ name, module = "global-search", config, isDefault = false }) {
  const { data, error } = await supabase.rpc("save_user_filter", {
    p_name: name,
    p_module: module,
    p_filter_config: config,
    p_is_default: isDefault,
  });
  if (error) throw error;
  return data;
}

export async function deleteSavedFilter(id) {
  const { error } = await supabase.from("saved_filters").delete().eq("id", id);
  if (error) throw error;
  return id;
}
