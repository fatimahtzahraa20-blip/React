function escapeCsvValue(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export default function exportToCsv({ rows, columns, fileName = "export.csv" }) {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const body = rows.map((row) => columns.map((column) => escapeCsvValue(
    typeof column.value === "function" ? column.value(row) : row[column.value]
  )).join(","));
  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
