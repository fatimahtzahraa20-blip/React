function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export { escapeHtml };

export function openPrintWindow({
  title,
  body,
  pageSize = "A4",
  width = "210mm",
  styles = "",
}) {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1000,height=800");
  if (!popup) throw new Error("Pop-up blocked. Allow pop-ups to print.");

  popup.document.open();
  popup.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: ${pageSize}; margin: 10mm; }
          * { box-sizing: border-box; }
          body { margin: 0 auto; width: ${width}; color: #0f172a; font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 7px; border-bottom: 1px solid #e2e8f0; text-align: left; }
          th { background: #f8fafc; font-size: 12px; }
          .print-actions { margin: 16px 0; text-align: right; }
          .print-actions button { border: 0; border-radius: 6px; background: #2563eb; color: white; padding: 9px 16px; cursor: pointer; }
          ${styles}
          @media print {
            .print-actions { display: none; }
            body { width: auto; }
          }
        </style>
      </head>
      <body>
        <div class="print-actions"><button onclick="window.print()">Print</button></div>
        ${body}
      </body>
    </html>`);
  popup.document.close();
  popup.focus();
  return popup;
}
