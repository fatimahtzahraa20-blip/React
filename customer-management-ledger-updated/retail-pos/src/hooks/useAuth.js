import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { getMyAccess } from "@/features/users/services/rbacService";
import { getSession, onAuthStateChange } from "@/services/authService";

export default function useAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setAccess = useAuthStore((state) => state.setAccess);

  useEffect(() => {
    let active = true;

    async function loadAccess(session) {
      if (!session) {
        setAccess();
        return;
      }
      try {
        const access = await getMyAccess();
        if (active) setAccess(access || {});
      } catch {
        if (active) setAccess();
      }
    }

    async function initialize() {
      try {
        const { data } = await getSession();
        if (!active) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        await loadAccess(data.session);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();
    const { data: listener } = onAuthStateChange((_event, session) => {
      if (!active) return;
      setSession(session);
      setUser(session?.user ?? null);
      loadAccess(session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [setAccess, setLoading, setSession, setUser]);
}
