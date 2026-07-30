import { create } from "zustand";

const asAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
};

const useCartStore = create((set) => ({
  items: [],
  customerId: "",
  warehouseId: "",
  discount: 0,
  tax: 0,
  addItem: (product) => set((state) => {
    const availableStock = asAmount(product.available_stock);
    const salePrice = asAmount(product.sale_price);
    if (!product.id || availableStock < 1) return state;
    const existing = state.items.find((item) => item.product_id === product.id);
    if (existing) {
      return {
        items: state.items.map((item) => item.product_id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, availableStock) }
          : item),
      };
    }
    return {
      items: [...state.items, {
        product_id: product.id,
        name: product.product_name || product.name || "Product",
        barcode: product.barcode,
        sale_price: salePrice,
        quantity: 1,
        available_stock: availableStock,
      }],
    };
  }),
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map((item) => {
      if (item.product_id !== productId) return item;
      const nextQuantity = Number(quantity);
      return {
        ...item,
        quantity: Number.isFinite(nextQuantity)
          ? Math.max(1, Math.min(nextQuantity, item.available_stock))
          : item.quantity,
      };
    }),
  })),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.product_id !== productId) })),
  setCustomerId: (customerId) => set({ customerId }),
  setWarehouseId: (warehouseId) => set({ warehouseId }),
  setDiscount: (discount) => set({ discount: asAmount(discount) }),
  setTax: (tax) => set({ tax: asAmount(tax) }),
  restore: (sale) => set({
    items: Array.isArray(sale.cart) ? sale.cart.map((item) => ({
      ...item,
      name: item.name || item.product_name || "Product",
      sale_price: asAmount(item.sale_price),
      quantity: Math.max(1, asAmount(item.quantity)),
      available_stock: Math.max(1, asAmount(item.available_stock || item.quantity)),
    })) : [],
    customerId: String(sale.customer_id || ""),
    warehouseId: String(sale.warehouse_id),
    discount: asAmount(sale.discount),
    tax: asAmount(sale.tax),
  }),
  clear: () => set({ items: [], customerId: "", discount: 0, tax: 0 }),
}));

export default useCartStore;

