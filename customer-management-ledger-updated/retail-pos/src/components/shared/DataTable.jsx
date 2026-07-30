import EmptyState from "./EmptyState";
import LoadingSkeleton from "./LoadingSkeleton";
import Pagination from "./Pagination";

export default function DataTable({ columns, data = [], getRowKey = (row) => row.id, isLoading = false, emptyState, pagination }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {isLoading ? (
        <LoadingSkeleton className="p-5" />
      ) : data.length === 0 ? (
        emptyState || <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60">
              <tr>
                {columns.map((column) => <th key={column.key} scope="col" className={column.headerClassName || "whitespace-nowrap px-4 py-3 text-left font-semibold"}>{column.header}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((row) => (
                <tr key={getRowKey(row)} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  {columns.map((column) => <td key={column.key} className={column.cellClassName || "whitespace-nowrap px-4 py-3"}>{column.render ? column.render(row) : row[column.key] ?? "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && pagination ? <Pagination {...pagination} /> : null}
    </div>
  );
}
