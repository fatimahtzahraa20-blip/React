import { useState, useMemo } from "react";

const PRODUCTS = [
  { id: 1, name: "Wireless Headphones", price: 79.99, emoji: "HD" },
  { id: 2, name: "Mechanical Keyboard", price: 129.00, emoji: "KB" },
  { id: 3, name: "Smart Watch", price: 199.50, emoji: "SW" },
  { id: 4, name: "Desk Lamp", price: 34.00, emoji: "DL" },
  { id: 5, name: "Backpack", price: 59.99, emoji: "BP" },
  { id: 6, name: "Coffee Mug", price: 14.00, emoji: "MG" },
];

const FREE_SHIP_THRESHOLD = 100;
const TAX_RATE = 0.08;

export default function App() {
  const [cart, setCart] = useState([]); // {id, qty}
  const [open, setOpen] = useState(false);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: product.id, qty: 1 }];
    });
    setOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev
      .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
      .filter((i) => i.qty > 0));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const items = useMemo(() => cart.map((ci) => ({ ...ci, product: PRODUCTS.find((p) => p.id === ci.id) })), [cart]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.product.price * i.qty, 0), [items]);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : 8.99;
  const total = subtotal + tax + shipping;
  const totalCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="wrap">
      <h1>Shop</h1>
      <p className="sub">Add items to your cart. Free shipping over ${FREE_SHIP_THRESHOLD}.</p>
      <div className="products">
        {PRODUCTS.map((p) => (
          <div className="pcard" key={p.id}>
            <div className="pimg">{p.emoji}</div>
            <div className="pname">{p.name}</div>
            <div className="pprice">${p.price.toFixed(2)}</div>
            <button className="addBtn" onClick={() => addToCart(p)}>Add to cart</button>
          </div>
        ))}
      </div>

      <button className="cartBtn" onClick={() => setOpen(true)}>
        Bag
        {totalCount > 0 && <span className="cartCount">{totalCount}</span>}
      </button>

      <div className={"overlay" + (open ? " open" : "")} onClick={() => setOpen(false)}></div>
      <div className={"drawer" + (open ? " open" : "")} role="dialog" aria-label="Shopping cart">
        <div className="dHead">
          <h3>Your Cart ({totalCount})</h3>
          <button className="closeBtn" aria-label="Close cart" onClick={() => setOpen(false)}>x</button>
        </div>
        <div className="dList">
          {items.length === 0 && <div className="empty">Your cart is empty</div>}
          {items.map((i) => (
            <div className="citem" key={i.id}>
              <div className="cimg">{i.product.emoji}</div>
              <div className="cbody">
                <div className="cname">{i.product.name}</div>
                <div className="cprice">${i.product.price.toFixed(2)}</div>
                <div className="qty">
                  <button aria-label={`Decrease ${i.product.name}`} onClick={() => updateQty(i.id, -1)}>-</button>
                  <span>{i.qty}</span>
                  <button aria-label={`Increase ${i.product.name}`} onClick={() => updateQty(i.id, 1)}>+</button>
                </div>
              </div>
              <button className="removeBtn" onClick={() => removeItem(i.id)}>Remove</button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="dFoot">
            <div className="sumRow"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="sumRow"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="sumRow"><span>Shipping</span><span>{shipping === 0 ? "Free" : "$" + shipping.toFixed(2)}</span></div>
            <div className="sumRow total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button className="checkoutBtn">Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
}
