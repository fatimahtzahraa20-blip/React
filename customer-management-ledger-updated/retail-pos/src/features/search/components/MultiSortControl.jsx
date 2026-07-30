import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

const options = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "title", label: "Name / reference" },
  { value: "amount", label: "Amount" },
  { value: "type", label: "Record type" },
];

export default function MultiSortControl({ value, onChange }) {
  const update = (index, patch) =>
    onChange(value.map((sort, current) => (current === index ? { ...sort, ...patch } : sort)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Sort priority</span>
        <button
          type="button"
          disabled={value.length >= options.length}
          onClick={() => {
            const next = options.find((option) => !value.some((sort) => sort.key === option.value));
            if (next) onChange([...value, { key: next.value, direction: "asc" }]);
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 disabled:opacity-40"
        >
          <Plus className="size-3.5" />
          Add sort
        </button>
      </div>
      {value.map((sort, index) => (
        <div key={`${sort.key}-${index}`} className="flex gap-2">
          <select
            value={sort.key}
            onChange={(event) => update(index, { key: event.target.value })}
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={value.some((item, itemIndex) => item.key === option.value && itemIndex !== index)}
              >
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            title={sort.direction === "asc" ? "Ascending" : "Descending"}
            onClick={() => update(index, { direction: sort.direction === "asc" ? "desc" : "asc" })}
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {sort.direction === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
          </button>
          {value.length > 1 ? (
            <button
              type="button"
              aria-label="Remove sort"
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              className="flex size-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
