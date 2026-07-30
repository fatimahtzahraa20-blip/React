import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import exportToCsv from "@/utils/exportToCsv";

function normalizeFileName(value, extension) {
  const base = String(value || "export")
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "export";
  return `${base}.${extension}`;
}

function resolveCell(row, column) {
  const value = typeof column.value === "function" ? column.value(row) : row[column.value];
  return value === null || value === undefined ? "" : value;
}

export function exportRowsToCsv({ rows, columns, fileName }) {
  exportToCsv({
    rows,
    columns,
    fileName: normalizeFileName(fileName, "csv"),
  });
}

export function exportRowsToExcel({ rows, columns, fileName, sheetName = "Data" }) {
  const data = rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.label, resolveCell(row, column)])),
  );
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, normalizeFileName(fileName, "xlsx"));
}

export function exportRowsToPdf({
  rows,
  columns,
  fileName,
  title = "Report",
  orientation = "landscape",
}) {
  const document = new jsPDF({ orientation });
  document.setFontSize(16);
  document.text(title, 14, 17);
  document.setFontSize(9);
  document.setTextColor(100);
  document.text(`Generated ${new Date().toLocaleString()}`, 14, 23);
  autoTable(document, {
    startY: 28,
    head: [columns.map((column) => column.label)],
    body: rows.map((row) => columns.map((column) => resolveCell(row, column))),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  document.save(normalizeFileName(fileName, "pdf"));
}
