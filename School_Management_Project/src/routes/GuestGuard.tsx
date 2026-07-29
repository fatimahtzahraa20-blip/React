import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function GuestGuard() {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <div className="route-loader"><span /></div>;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
