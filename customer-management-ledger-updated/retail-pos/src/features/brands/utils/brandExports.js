import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function exportRows(brands) {
  return brands.map((brand) => ({
    Name: brand.name,
    Description: brand.description || "",
    Status: brand.status ? "Active" : "Inactive",
    Created: brand.created_at ? new Date(brand.created_at).toLocaleDateString() : "",
  }));
}

export function exportBrandsPdf(brands) {
  const document = new jsPDF();
  document.setFontSize(18);
  document.text("Brand Report", 14, 18);
  document.setFontSize(10);
  document.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
  autoTable(document, {
    startY: 32,
    head: [["Name", "Description", "Status", "Created"]],
    body: exportRows(brands).map((row) => [row.Name, row.Description, row.Status, row.Created]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  document.save("brands.pdf");
}

export function exportBrandsExcel(brands) {
  const worksheet = XLSX.utils.json_to_sheet(exportRows(brands));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");
  XLSX.writeFile(workbook, "brands.xlsx");
}
