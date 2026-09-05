import { supabase } from "@/lib/supabase";
import type { InstituteSettings } from "@/types/database.types";

const FALLBACK: InstituteSettings = { id: 1, institute_name: "School", logo_url: null, updated_at: "" };

export async function getInstituteSettings() {
  const { data, error } = await supabase.from("institute_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data as InstituteSettings | null) ?? FALLBACK;
}

export async function saveInstituteSettings(input: { institute_name: string; logo_url?: string | null }) {
  const { data, error } = await supabase
    .from("institute_settings")
    .upsert({ id: 1, ...input })
    .select()
    .single();
  if (error) throw error;
  return data as InstituteSettings;
}
