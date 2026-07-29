import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { AppRole } from "@/types/database.types";

export function RoleGuard({ allowed }: { allowed: AppRole[] }) {
  const roles = useAuthStore((state) => state.roles);
  return roles.some((role) => allowed.includes(role)) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}
