export default function printContent({ title, headers, rows }) {
  const popup = window.open("", "_blank", "width=1000,height=700");
  if (!popup) throw new Error("Allow pop-ups to print this report.");

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);

  popup.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:12px}th{background:#f1f5f9}@media print{body{padding:0}}</style></head><body><h1>${escapeHtml(title)}</h1><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}
