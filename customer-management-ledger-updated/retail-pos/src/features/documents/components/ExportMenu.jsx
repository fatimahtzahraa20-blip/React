import { useState } from "react";
import { ChevronDown, FileSpreadsheet, FileText, Sheet } from "lucide-react";

import {
  exportRowsToCsv,
  exportRowsToExcel,
  exportRowsToPdf,
} from "../utils/documentExport";

export default function ExportMenu({
  rows,
  columns,
  fileName = "export",
  title = "Export",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const options = [
    {
      label: "Export PDF",
      icon: FileText,
      action: () => exportRowsToPdf({ rows, columns, fileName, title }),
    },
    {
      label: "Export Excel",
      icon: FileSpreadsheet,
      action: () => exportRowsToExcel({ rows, columns, fileName, sheetName: title }),
    },
    {
      label: "Export CSV",
      icon: Sheet,
      action: () => exportRowsToCsv({ rows, columns, fileName }),
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || !rows.length}
        onClick={() => setOpen(!open)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        <FileSpreadsheet className="size-4" />
        Export
        <ChevronDown className="size-4" />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close export menu"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 min-w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {options.map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  action();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
