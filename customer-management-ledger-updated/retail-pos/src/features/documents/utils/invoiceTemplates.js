import { escapeHtml, openPrintWindow } from "./printWindow";

const money = (value, currency = "Rs") => `${escapeHtml(currency)} ${Number(value || 0).toFixed(2)}`;

function invoiceItems(invoice) {
  return (invoice.items || [])
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.product?.product_name || item.name || "Item")}</td>
        <td>${Number(item.quantity || 0)}</td>
        <td>${money(item.sale_price)}</td>
        <td>${money(item.discount)}</td>
        <td style="text-align:right">${money(item.total)}</td>
      </tr>`,
    )
    .join("");
}

export function printA4Invoice(invoice, company = {}) {
  const body = `
    <header style="display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #2563eb;padding-bottom:18px">
      <div>
        ${company.logo_url ? `<img src="${escapeHtml(company.logo_url)}" alt="" style="max-height:60px;max-width:180px" />` : ""}
        <h1 style="margin:8px 0 3px">${escapeHtml(company.company_name || "Retail POS")}</h1>
        <div style="font-size:12px;color:#475569">${escapeHtml(company.address || "")}</div>
      </div>
      <div style="text-align:right">
        <h2 style="margin:0;color:#2563eb">INVOICE</h2>
        <strong>${escapeHtml(invoice.invoice_no)}</strong>
        <div>${escapeHtml(invoice.invoice_date)}</div>
      </div>
    </header>
    <section style="display:flex;justify-content:space-between;padding:18px 0">
      <div><small>BILL TO</small><br /><strong>${escapeHtml(invoice.customer?.name || "Walking Customer")}</strong><br />${escapeHtml(invoice.customer?.phone || "")}</div>
      <div style="text-align:right">Payment: ${escapeHtml(invoice.payment_method || "")}<br />Status: ${escapeHtml(invoice.status || "completed")}</div>
    </section>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Discount</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${invoiceItems(invoice)}</tbody>
    </table>
    <section style="margin-left:auto;margin-top:18px;width:280px">
      <p style="display:flex;justify-content:space-between"><span>Subtotal</span><span>${money(invoice.subtotal, company.currency_symbol)}</span></p>
      <p style="display:flex;justify-content:space-between"><span>Discount</span><span>${money(invoice.discount, company.currency_symbol)}</span></p>
      <p style="display:flex;justify-content:space-between"><span>Tax</span><span>${money(invoice.tax, company.currency_symbol)}</span></p>
      <p style="display:flex;justify-content:space-between;border-top:2px solid #0f172a;padding-top:8px;font-size:18px"><strong>Total</strong><strong>${money(invoice.grand_total, company.currency_symbol)}</strong></p>
      <p style="display:flex;justify-content:space-between"><span>Paid</span><span>${money(invoice.paid_amount, company.currency_symbol)}</span></p>
      <p style="display:flex;justify-content:space-between"><span>Due</span><span>${money(invoice.due_amount, company.currency_symbol)}</span></p>
    </section>
    ${company.invoice_terms ? `<section style="margin-top:30px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:12px"><strong>Terms</strong><p>${escapeHtml(company.invoice_terms)}</p></section>` : ""}
    <footer style="margin-top:28px;text-align:center;font-size:12px;color:#64748b">${escapeHtml(company.invoice_footer || "Thank you for your business")}</footer>
  `;
  return openPrintWindow({ title: invoice.invoice_no, body, pageSize: "A4 portrait" });
}

export function printThermalReceipt(invoice, company = {}, paperSize = "80mm") {
  const width = paperSize === "58mm" ? "58mm" : "80mm";
  const body = `
    <header style="text-align:center">
      <h2 style="margin:0">${escapeHtml(company.company_name || "Retail POS")}</h2>
      <div>${escapeHtml(company.receipt_header || "")}</div>
      <p>${escapeHtml(invoice.invoice_no)}<br />${escapeHtml(invoice.invoice_date)}</p>
    </header>
    <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:7px 0;font-size:11px">
      Customer: ${escapeHtml(invoice.customer?.name || "Walking Customer")}<br />
      Payment: ${escapeHtml(invoice.payment_method || "")}
    </div>
    <table style="font-size:11px">
      <tbody>${(invoice.items || []).map((item) => `<tr><td>${escapeHtml(item.product?.product_name || item.name || "Item")}<br /><small>${Number(item.quantity || 0)} × ${Number(item.sale_price || 0).toFixed(2)}</small></td><td style="text-align:right">${Number(item.total || 0).toFixed(2)}</td></tr>`).join("")}</tbody>
    </table>
    <div style="border-top:1px dashed #000;padding-top:7px;font-size:12px">
      <p style="display:flex;justify-content:space-between"><span>Total</span><strong>${money(invoice.grand_total, company.currency_symbol)}</strong></p>
      <p style="display:flex;justify-content:space-between"><span>Paid</span><span>${money(invoice.paid_amount, company.currency_symbol)}</span></p>
      <p style="display:flex;justify-content:space-between"><span>Due</span><span>${money(invoice.due_amount, company.currency_symbol)}</span></p>
    </div>
    <footer style="text-align:center;font-size:11px">${escapeHtml(company.receipt_footer || "Thank you for your purchase")}</footer>
  `;
  return openPrintWindow({
    title: `Receipt ${invoice.invoice_no}`,
    body,
    pageSize: `${width} auto`,
    width,
    styles: "body{font-family:monospace;padding:2mm}.print-actions{margin:4px 0}th,td{padding:4px 0}",
  });
}
