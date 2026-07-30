import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function exportRows(units) {
  return units.map((unit) => ({
    Name: unit.name,
    "Short Name": unit.short_name,
    Status: unit.status ? "Active" : "Inactive",
    Created: unit.created_at ? new Date(unit.created_at).toLocaleDateString() : "",
  }));
}

export function exportUnitsPdf(units) {
  const document = new jsPDF();
  document.setFontSize(18);
  document.text("Unit Report", 14, 18);
  document.setFontSize(10);
  document.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
  autoTable(document, {
    startY: 32,
    head: [["Name", "Short Name", "Status", "Created"]],
    body: exportRows(units).map((row) => [row.Name, row["Short Name"], row.Status, row.Created]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  document.save("units.pdf");
}

export function exportUnitsExcel(units) {
  const worksheet = XLSX.utils.json_to_sheet(exportRows(units));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Units");
  XLSX.writeFile(workbook, "units.xlsx");
}
