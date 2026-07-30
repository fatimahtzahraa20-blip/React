import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function exportRows(categories) {
  return categories.map((category) => ({
    Name: category.name,
    Description: category.description || "",
    Status: category.status ? "Active" : "Inactive",
    Created: category.created_at ? new Date(category.created_at).toLocaleDateString() : "",
  }));
}

export function exportCategoriesPdf(categories) {
  const document = new jsPDF();
  document.setFontSize(18);
  document.text("Category Report", 14, 18);
  document.setFontSize(10);
  document.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
  autoTable(document, {
    startY: 32,
    head: [["Name", "Description", "Status", "Created"]],
    body: exportRows(categories).map((row) => [row.Name, row.Description, row.Status, row.Created]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  document.save("categories.pdf");
}

export function exportCategoriesExcel(categories) {
  const worksheet = XLSX.utils.json_to_sheet(exportRows(categories));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
  XLSX.writeFile(workbook, "categories.xlsx");
}
