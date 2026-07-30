import { Download } from "lucide-react";

export default function ExportButton({ onExport, label = "Export", disabled = false }) {
  return (
    <button type="button" onClick={onExport} disabled={disabled} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
      <Download className="size-4" /> {label}
    </button>
  );
}
