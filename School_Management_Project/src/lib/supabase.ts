import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/config/env";

export { isSupabaseConfigured };

export const supabase = createClient(
  env.VITE_SUPABASE_URL || "https://placeholder.supabase.co",
  env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key-for-local-configuration",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "school-auth",
    },
  },
);
