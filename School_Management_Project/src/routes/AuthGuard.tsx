import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard() {
  const { user, initialized } = useAuthStore();
  const location = useLocation();
  if (!initialized) return <div className="route-loader"><span /><p>Loading your workspace…</p></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
