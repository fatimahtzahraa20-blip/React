import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../api/auth.api";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const roles = useAuthStore((state) => state.roles);
  const initialized = useAuthStore((state) => state.initialized);
  const clear = useAuthStore((state) => state.clear);
  const navigate = useNavigate();
  const logout = useCallback(async () => {
    await signOut(); clear(); navigate("/login", { replace: true });
  }, [clear, navigate]);
  return { user, profile, roles, initialized, logout };
}
