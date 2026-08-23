// Centralized RBAC configuration: roles map to a set of permission strings.
// Real apps typically fetch this from an auth service / JWT claims; here it's
// static so the demo is self-contained.

export const ROLES = ["admin", "editor", "viewer"];

export const ROLE_PERMISSIONS = {
  admin: [
    "dashboard.view",
    "users.view",
    "users.invite",
    "users.edit_role",
    "users.remove",
    "billing.view",
    "billing.edit",
    "settings.view",
    "settings.edit",
  ],
  editor: ["dashboard.view", "users.view", "billing.view", "settings.view"],
  viewer: ["dashboard.view", "users.view"],
};

export function can(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "\u{1F4CA}", permission: "dashboard.view" },
  { id: "users", label: "Users", icon: "\u{1F465}", permission: "users.view" },
  { id: "billing", label: "Billing", icon: "\u{1F4B3}", permission: "billing.view" },
  { id: "settings", label: "Settings", icon: "\u2699\uFE0F", permission: "settings.view" },
];

