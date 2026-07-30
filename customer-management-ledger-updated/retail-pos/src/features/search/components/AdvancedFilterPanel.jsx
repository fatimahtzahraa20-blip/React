import { CalendarDays, SlidersHorizontal } from "lucide-react";

import MultiSortControl from "./MultiSortControl";

const recordTypes = [
  { value: "customer", label: "Customers" },
  { value: "supplier", label: "Suppliers" },
  { value: "product", label: "Products" },
  { value: "sale", label: "Sales" },
];

export default function AdvancedFilterPanel({
  types,
  status,
  from,
  to,
  sorts,
  onToggleType,
  onStatusChange,
  onDateChange,
  onSortChange,
  onReset,
}) {
  return (
    <aside className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="size-4" />
          Advanced filters
        </h2>
        <button type="button" onClick={onReset} className="text-xs font-medium text-blue-600">
          Reset
        </button>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Record types</legend>
        <div className="space-y-2">
          {recordTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={types.includes(type.value)}
                onChange={() => onToggleType(type.value)}
                className="size-4 accent-blue-600"
              />
              {type.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Status</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>
      </label>

      <fieldset className="space-y-3">
        <legend className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="size-4" />
          Date range
        </legend>
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">From</span>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => onDateChange({ from: event.target.value, to })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">To</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => onDateChange({ from, to: event.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </fieldset>

      <MultiSortControl value={sorts} onChange={onSortChange} />
    </aside>
  );
}
