import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const rows = (products) => products.map((product) => ({
  SKU: product.sku,
  Name: product.name,
  Category: product.category?.name || "",
  Brand: product.brand?.name || "",
  Cost: Number(product.cost_price || 0),
  Sale: Number(product.sale_price || 0),
  Stock: Number(product.current_stock ?? product.stock_quantity ?? 0),
  Status: product.status ? "Active" : "Inactive",
}));

export function exportProductsPdf(products) {
  const document = new jsPDF({ orientation: "landscape" });
  document.text("Product Report", 14, 18);
  autoTable(document, {
    startY: 25,
    head: [["SKU", "Name", "Category", "Brand", "Cost", "Sale", "Stock", "Status"]],
    body: rows(products).map(Object.values),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  document.save("products.pdf");
}

export function exportProductsExcel(products) {
  const worksheet = XLSX.utils.json_to_sheet(rows(products));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  XLSX.writeFile(workbook, "products.xlsx");
}
