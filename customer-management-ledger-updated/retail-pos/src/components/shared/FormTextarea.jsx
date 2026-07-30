import { cn } from "@/lib/utils";

export default function FormTextarea({ label, error, required, className, id, rows = 4, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}{required ? <span className="text-red-500"> *</span> : null}</label> : null}
      <textarea id={inputId} rows={rows} aria-invalid={Boolean(error)} className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 aria-invalid:border-red-500 dark:border-slate-700 dark:bg-slate-900" {...props} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
