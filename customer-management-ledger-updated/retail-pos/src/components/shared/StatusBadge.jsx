import { cn } from "@/lib/utils";

const variants = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default function StatusBadge({ status, label, className }) {
  const normalized = typeof status === "boolean" ? (status ? "active" : "inactive") : String(status || "inactive").toLowerCase();
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize", variants[normalized] || variants.inactive, className)}>{label || normalized}</span>;
}
