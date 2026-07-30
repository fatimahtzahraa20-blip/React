import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchInput({ value, onChange, placeholder = "Search...", className, ...props }) {
  return (
    <div className={cn("relative w-full sm:max-w-sm", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900" {...props} />
      {value ? (
        <button type="button" onClick={() => onChange("")} className="absolute right-2 top-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label="Clear search">
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
