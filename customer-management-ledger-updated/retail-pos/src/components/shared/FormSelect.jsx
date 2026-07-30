import { cn } from "@/lib/utils";

export default function FormSelect({ label, error, required, options = [], placeholder = "Select an option", className, id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}{required ? <span className="text-red-500"> *</span> : null}</label> : null}
      <select id={inputId} aria-invalid={Boolean(error)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 aria-invalid:border-red-500 dark:border-slate-700 dark:bg-slate-900" {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
