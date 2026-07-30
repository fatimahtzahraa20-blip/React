import JsBarcode from "jsbarcode";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function printDocument({ title, body, pageSize = "A4", width = "auto", styles = "" }) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);

  const frameDocument = frame.contentDocument;
  frameDocument.open();
  frameDocument.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page{size:${pageSize};margin:8mm}*{box-sizing:border-box}body{margin:0 auto;width:${width};color:#0f172a;font-family:Arial,sans-serif}
    table{width:100%;border-collapse:collapse}th,td{padding:7px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f8fafc}
    ${styles}
  </style></head><body>${body}</body></html>`);
  frameDocument.close();

  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    window.setTimeout(() => frame.remove(), 1000);
  };
}

const money = (value, currency) => `${escapeHtml(currency || "Rs")} ${Number(value || 0).toFixed(2)}`;

export function printInvoice(invoice, company = {}) {
  const items = (invoice.items || []).map((item) => `<tr><td>${escapeHtml(item.product?.product_name || item.name || "Item")}</td><td>${Number(item.quantity || 0)}</td><td>${money(item.sale_price, company.currency_symbol)}</td><td style="text-align:right">${money(item.total, company.currency_symbol)}</td></tr>`).join("");
  printDocument({
    title: invoice.invoice_no,
    pageSize: "A4 portrait",
    body: `<header style="display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:16px"><div>${company.logo_url ? `<img src="${escapeHtml(company.logo_url)}" style="max-height:55px;max-width:160px">` : ""}<h1>${escapeHtml(company.company_name || "Retail POS")}</h1><small>${escapeHtml(company.address || "")}</small></div><div style="text-align:right"><h2 style="color:#2563eb">INVOICE</h2><strong>${escapeHtml(invoice.invoice_no)}</strong><br>${escapeHtml(invoice.invoice_date)}</div></header><section style="padding:18px 0"><small>BILL TO</small><br><strong>${escapeHtml(invoice.customer?.name || "Walking Customer")}</strong></section><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${items}</tbody></table><section style="margin:18px 0 0 auto;width:280px"><p style="display:flex;justify-content:space-between"><span>Subtotal</span><span>${money(invoice.subtotal, company.currency_symbol)}</span></p><p style="display:flex;justify-content:space-between"><span>Discount</span><span>${money(invoice.discount, company.currency_symbol)}</span></p><p style="display:flex;justify-content:space-between"><span>Tax</span><span>${money(invoice.tax, company.currency_symbol)}</span></p><p style="display:flex;justify-content:space-between;border-top:2px solid;padding-top:8px;font-size:18px"><strong>Total</strong><strong>${money(invoice.grand_total, company.currency_symbol)}</strong></p><p style="display:flex;justify-content:space-between"><span>Due</span><span>${money(invoice.due_amount, company.currency_symbol)}</span></p></section><footer style="margin-top:28px;text-align:center">${escapeHtml(company.invoice_footer || "Thank you for your business")}</footer>`,
  });
}

export function printReceipt(invoice, company = {}, paperSize = "80mm") {
  const width = paperSize === "58mm" ? "58mm" : "80mm";
  const items = (invoice.items || []).map((item) => `<tr><td>${escapeHtml(item.product?.product_name || item.name || "Item")}<br><small>${Number(item.quantity || 0)} × ${Number(item.sale_price || 0).toFixed(2)}</small></td><td style="text-align:right">${Number(item.total || 0).toFixed(2)}</td></tr>`).join("");
  printDocument({
    title: `Receipt ${invoice.invoice_no}`,
    pageSize: `${width} auto`,
    width,
    styles: "body{font-family:monospace;padding:2mm;font-size:11px}th,td{padding:4px 0}",
    body: `<header style="text-align:center"><h2>${escapeHtml(company.company_name || "Retail POS")}</h2><div>${escapeHtml(company.receipt_header || "")}</div><p>${escapeHtml(invoice.invoice_no)}<br>${escapeHtml(invoice.invoice_date)}</p></header><div style="border-block:1px dashed;padding:6px 0">Customer: ${escapeHtml(invoice.customer?.name || "Walking Customer")}<br>Payment: ${escapeHtml(invoice.payment_method || "")}</div><table><tbody>${items}</tbody></table><section style="border-top:1px dashed"><p style="display:flex;justify-content:space-between"><strong>Total</strong><strong>${money(invoice.grand_total, company.currency_symbol)}</strong></p><p style="display:flex;justify-content:space-between"><span>Paid</span><span>${money(invoice.paid_amount, company.currency_symbol)}</span></p><p style="display:flex;justify-content:space-between"><span>Due</span><span>${money(invoice.due_amount, company.currency_symbol)}</span></p></section><footer style="text-align:center">${escapeHtml(company.receipt_footer || "Thank you for your purchase")}</footer>`,
  });
}

export function printLabels({ products, copies = 1, columns = 3, showPrice = true, currency = "Rs" }) {
  const labels = products.flatMap((product) => Array.from({ length: Math.max(1, Number(copies) || 1) }, () => {
    const code = product.barcode || product.sku;
    if (!code) return "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, String(code), { format: "CODE128", width: 1.5, height: 44, margin: 2, fontSize: 12 });
    return `<article class="label"><strong>${escapeHtml(product.product_name || product.name)}</strong>${new XMLSerializer().serializeToString(svg)}${showPrice ? `<span>${escapeHtml(currency)} ${Number(product.sale_price || 0).toFixed(2)}</span>` : ""}</article>`;
  })).join("");
  if (!labels) throw new Error("Selected products do not have a barcode or SKU.");
  printDocument({
    title: "Barcode Labels",
    pageSize: "A4 portrait",
    body: `<main class="labels">${labels}</main>`,
    styles: `.labels{display:grid;grid-template-columns:repeat(${Math.min(Math.max(columns, 1), 5)},1fr);gap:4mm}.label{min-height:32mm;border:1px dashed #94a3b8;padding:3mm;text-align:center;break-inside:avoid;font-size:11px}.label strong,.label span{display:block}.label svg{max-width:100%;height:18mm}`,
  });
}
