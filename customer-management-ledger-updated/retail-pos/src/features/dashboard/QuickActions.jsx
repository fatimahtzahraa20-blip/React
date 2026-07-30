import { Link } from "react-router-dom";
import { CircleDollarSign, PackagePlus, ShoppingCart, UserPlus, WalletCards } from "lucide-react";

const actions = [
  { label: "New Sale", to: "/pos", icon: ShoppingCart },
  { label: "Add Product", to: "/products/new", icon: PackagePlus },
  { label: "Add Customer", to: "/customers/new", icon: UserPlus },
  { label: "New Purchase", to: "/purchases/new", icon: WalletCards },
  { label: "Add Expense", to: "/expenses", icon: CircleDollarSign },
];

export default function QuickActions() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_25px_-20px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        {actions.map(({ label, to, icon: Icon }) => (
          <Link key={label} to={to} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 dark:border-slate-700">
            <Icon className="size-4" /> {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

