import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getCurrentSession,
  subscribeToAuthChanges,
} from "../services/auth.service";

interface UseAuthResult {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export default function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const currentSession = await getCurrentSession();

        if (!isMounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error("Failed to load session:", error);

        if (!isMounted) {
          return;
        }

        setSession(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    const unsubscribe = subscribeToAuthChanges(
      (currentUser, currentSession) => {
        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        setSession(currentSession);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user && session),
  };
}