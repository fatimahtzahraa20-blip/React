export const routePermissions = {
  "/dashboard": "dashboard.view", "/customers": "customers.view", "/customer-ledger": "customers.view", "/suppliers": "suppliers.view",
  "/categories": "products.view", "/brands": "products.view", "/units": "products.view", "/products": "products.view",
  "/purchases": "purchases.view", "/stock": "stock.view", "/stock-adjustment": "stock.adjust",
  "/pos": "pos.view", "/sales": "sales.view", "/accounts": "accounts.view", "/cash-book": "accounts.view",
  "/expense": "expenses.view", "/expenses": "expenses.view", "/payments": "payments.view", "/reports": "reports.view",
  "/users": "users.view", "/roles": "roles.view", "/permissions": "roles.view", "/settings": "settings.view",
};

export function permissionForPath(pathname) {
  const match = Object.keys(routePermissions).sort((a, b) => b.length - a.length).find((path) => pathname === path || pathname.startsWith(`${path}/`));
  return match ? routePermissions[match] : null;
}
