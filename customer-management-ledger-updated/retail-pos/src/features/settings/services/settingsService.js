import { supabase } from "@/lib/supabase";
import { settingsDefaults } from "../schemas/settingsSchema";

const LOCAL_KEY = "retail-pro-settings";
const normalizeSettings = (values = {}) => Object.fromEntries(
  Object.entries(settingsDefaults).map(([key, defaultValue]) => [
    key,
    values?.[key] ?? defaultValue,
  ])
);
const readLocal = () => {
  try { return normalizeSettings(JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}")); }
  catch { return { ...settingsDefaults }; }
};
const writeLocal = (settings) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
  return settings;
};

export async function getSettings() {
  const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return readLocal();
  const merged = normalizeSettings(data);
  writeLocal(merged);
  return merged;
}

export async function updateSettings(values) {
  const { id, created_at, updated_at, updated_by, ...settings } = values;
  const localSettings = normalizeSettings(settings);
  const { data, error } = await supabase.rpc("update_app_settings", { p_settings: settings });
  if (error) {
    const unavailable = ["PGRST202", "42P01", "42883"].includes(error.code) || /could not find|does not exist/i.test(error.message || "");
    if (unavailable) return writeLocal(localSettings);
    throw error;
  }
  return writeLocal(normalizeSettings(data || settings));
}

export async function uploadCompanyLogo(file) {
  if (!file) throw new Error("Choose a logo file");
  if (file.size > 2 * 1024 * 1024) throw new Error("Logo must be 2 MB or smaller");
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `logo/company-logo-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("company-assets").upload(path, file, { cacheControl: "3600", upsert: true });
  if (error) throw new Error(`${error.message}. Apply the Settings migration to enable company logo storage.`);
  return supabase.storage.from("company-assets").getPublicUrl(path).data.publicUrl;
}
