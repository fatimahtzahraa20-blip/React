import { createContext, useContext } from "react";
import { can } from "./permissions.js";

const AuthContext = createContext(null);

export function AuthProvider({ role, children }) {
  return <AuthContext.Provider value={{ role }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function usePermission(permission) {
  const { role } = useAuth();
  return can(role, permission);
}

/** Renders children only if the current role has the permission; otherwise renders `fallback`. */
export function Can({ permission, children, fallback = null }) {
  const allowed = usePermission(permission);
  return allowed ? children : fallback;
}

/** Wraps an entire page/section; shows an access-denied state if unauthorized. */
export function ProtectedSection({ permission, children }) {
  const allowed = usePermission(permission);
  if (!allowed) {
    return (
      <div className="access-denied">
        <div className="icon">{"\u{1F512}"}</div>
        <h3>Access restricted</h3>
        <p>Your current role doesn't have permission to view this section.</p>
      </div>
    );
  }
  return children;
}

