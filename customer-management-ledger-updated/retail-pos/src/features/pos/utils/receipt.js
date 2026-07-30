import jsPDF from "jspdf";

export function downloadReceipt(invoice) {
  const document = new jsPDF({ unit: "mm", format: [80, 160] });
  document.setFontSize(14);
  document.text("RETAIL POS", 40, 10, { align: "center" });
  document.setFontSize(9);
  document.text(invoice.invoice_no, 40, 17, { align: "center" });
  let y = 27;
  invoice.items.forEach((item) => {
    document.text(item.product?.product_name || "Product", 5, y);
    document.text(`${item.quantity} x ${Number(item.sale_price).toFixed(2)}`, 75, y, { align: "right" });
    y += 6;
  });
  y += 3;
  document.text(`Total: ${Number(invoice.grand_total).toFixed(2)}`, 75, y, { align: "right" });
  document.text(`Paid: ${Number(invoice.paid_amount).toFixed(2)}`, 75, y + 6, { align: "right" });
  document.text(`Due: ${Number(invoice.due_amount).toFixed(2)}`, 75, y + 12, { align: "right" });
  document.save(`${invoice.invoice_no}.pdf`);
}
