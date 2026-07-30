import JsBarcode from "jsbarcode";

import { escapeHtml, openPrintWindow } from "./printWindow";

function createBarcodeSvg(value) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(element, String(value), {
    format: "CODE128",
    width: 1.6,
    height: 46,
    margin: 2,
    displayValue: true,
    fontSize: 12,
  });
  return new XMLSerializer().serializeToString(element);
}

export function printBarcodeLabels({
  products,
  copies = 1,
  columns = 3,
  showPrice = true,
  currency = "Rs",
}) {
  const labels = products.flatMap((product) =>
    Array.from({ length: Math.max(1, Number(copies) || 1) }, () => {
      const code = product.barcode || product.sku;
      if (!code) return "";
      return `<article class="label">
        <strong>${escapeHtml(product.product_name || product.name)}</strong>
        ${createBarcodeSvg(code)}
        ${showPrice ? `<span>${escapeHtml(currency)} ${Number(product.sale_price || 0).toFixed(2)}</span>` : ""}
      </article>`;
    }),
  ).join("");

  if (!labels) throw new Error("Selected products do not have a barcode or SKU.");

  return openPrintWindow({
    title: "Barcode Labels",
    body: `<main class="labels">${labels}</main>`,
    pageSize: "A4 portrait",
    styles: `
      .labels{display:grid;grid-template-columns:repeat(${Math.min(Math.max(columns, 1), 5)},1fr);gap:4mm}
      .label{min-height:32mm;border:1px dashed #94a3b8;padding:3mm;text-align:center;break-inside:avoid;font-size:11px}
      .label strong,.label span{display:block}.label svg{max-width:100%;height:18mm}
    `,
  });
}
