import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20),
  VITE_APP_URL: z.string().url().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(import.meta.env);

export const env = parsed.success
  ? parsed.data
  : {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ?? "",
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
      VITE_APP_URL: import.meta.env.VITE_APP_URL ?? window.location.origin,
    };

export const isSupabaseConfigured = parsed.success;
