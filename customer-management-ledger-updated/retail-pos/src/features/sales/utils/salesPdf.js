import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportSalesPdf(sales) {
  const document = new jsPDF({ orientation: "landscape" });
  document.text("Sales Report", 14, 18);
  autoTable(document, {
    startY: 25,
    head: [["Invoice", "Date", "Customer", "Total", "Paid", "Due", "Status"]],
    body: sales.map((sale) => [sale.invoice_no, sale.invoice_date, sale.customer?.name || "Walking Customer", sale.grand_total, sale.paid_amount, sale.due_amount, sale.status]),
    headStyles: { fillColor: [37, 99, 235] },
  });
  document.save("sales.pdf");
}
