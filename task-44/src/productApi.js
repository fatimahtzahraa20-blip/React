const CATALOG = {
  electronics: [
    { id: "e1", name: "Wireless Headphones", price: 89, stock: 24 },
    { id: "e2", name: "Mechanical Keyboard", price: 129, stock: 11 },
  ],
  home: [
    { id: "h1", name: "Ceramic Mug Set", price: 34, stock: 42 },
    { id: "h2", name: "Reading Lamp", price: 58, stock: 7 },
  ],
  outdoors: [
    { id: "o1", name: "Trail Backpack", price: 145, stock: 18 },
    { id: "o2", name: "Insulated Bottle", price: 29, stock: 63 },
  ],
};

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchCategory(category) {
  await wait(500 + Math.random() * 700);
  return CATALOG[category].map((p) => ({ ...p }));
}

export async function updateStock(category, productId, delta) {
  await wait(300 + Math.random() * 300);
  const product = CATALOG[category].find((p) => p.id === productId);
  if (product) product.stock = Math.max(0, product.stock + delta);
  return product;
}

export const CATEGORIES = Object.keys(CATALOG);
