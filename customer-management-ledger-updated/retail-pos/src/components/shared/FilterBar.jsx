import { Filter, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

export default function FilterBar({ children, onReset, active = false, className }) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="flex flex-1 flex-wrap items-end gap-3">
        <div className="flex h-10 items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300"><Filter className="size-4" /> Filters</div>
        {children}
      </div>
      {onReset ? <button type="button" onClick={onReset} disabled={!active} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"><RotateCcw className="size-4" /> Reset</button> : null}
    </div>
  );
}
