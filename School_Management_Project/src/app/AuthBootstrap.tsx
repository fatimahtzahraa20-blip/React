import { useEffect, type ReactNode } from "react";
import { getAuthUser } from "@/features/auth/api/auth.api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { setAuth, setInitialized, clear } = useAuthStore();
  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) { setInitialized(true); return; }
    async function hydrate(user: Parameters<typeof setAuth>[0]) {
      if (!active) return;
      if (!user) { clear(); setInitialized(true); return; }
      try {
        const authUser = await getAuthUser(user.id);
        if (!authUser.profile.is_active) throw new Error("Account deactivated");
        if (active) setAuth(user, authUser.profile, authUser.roles);
      } catch {
        if (active) clear();
      } finally { if (active) setInitialized(true); }
    }
    supabase.auth.getSession().then(({ data }) => hydrate(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => hydrate(session?.user ?? null), 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [clear, setAuth, setInitialized]);
  return children;
}
