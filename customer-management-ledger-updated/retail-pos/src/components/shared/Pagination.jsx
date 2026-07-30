import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <p className="text-sm text-slate-500">Showing {start}–{end} of {total}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700">
          <ChevronLeft className="size-4" /> Previous
        </button>
        <span className="px-2 text-sm font-medium">{page} / {totalPages}</span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700">
          Next <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
