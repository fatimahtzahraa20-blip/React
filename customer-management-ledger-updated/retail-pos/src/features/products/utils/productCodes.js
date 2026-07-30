export function generateSku(name = "") {
  const prefix = name.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "PROD";
  const stamp = Date.now().toString().slice(-6);
  return `${prefix}-${stamp}`;
}

export function generateBarcode() {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 90 + 10);
  return `${timestamp}${random}`;
}
