import { useState, useMemo, useEffect } from "react";

const PRODUCTS = [
  { id: 1, name: "Wireless Headphones", category: "Audio", price: 79.99, emoji: "HD", rating: 4 },
  { id: 2, name: "Mechanical Keyboard", category: "Accessories", price: 129.00, emoji: "KB", rating: 5 },
  { id: 3, name: "Smart Watch", category: "Wearables", price: 199.50, emoji: "SW", rating: 4 },
  { id: 4, name: "Desk Lamp", category: "Home", price: 34.00, emoji: "DL", rating: 3 },
  { id: 5, name: "Backpack", category: "Accessories", price: 59.99, emoji: "BP", rating: 5 },
  { id: 6, name: "Bluetooth Speaker", category: "Audio", price: 44.00, emoji: "BS", rating: 4 },
  { id: 7, name: "Fitness Band", category: "Wearables", price: 39.00, emoji: "FB", rating: 3 },
  { id: 8, name: "Office Chair", category: "Home", price: 249.00, emoji: "OC", rating: 5 },
  { id: 9, name: "USB-C Hub", category: "Accessories", price: 29.99, emoji: "UH", rating: 4 },
];

const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];

// --- Minimal URL query-string sync (no react-router needed) ---
function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    categories: params.get("cat") ? params.get("cat").split(",") : [],
    maxPrice: params.get("max") ? Number(params.get("max")) : 300,
    minRating: params.get("rating") ? Number(params.get("rating")) : 0,
    sort: params.get("sort") || "relevance",
  };
}

function setQuery(state) {
  const params = new URLSearchParams();
  if (state.categories.length) params.set("cat", state.categories.join(","));
  if (state.maxPrice < 300) params.set("max", state.maxPrice);
  if (state.minRating > 0) params.set("rating", state.minRating);
  if (state.sort !== "relevance") params.set("sort", state.sort);
  const qs = params.toString();
  const url = window.location.pathname + (qs ? "?" + qs : "");
  window.history.replaceState({}, "", url);
}

export default function App() {
  const [state, setState] = useState(getQuery());

  useEffect(() => { setQuery(state); }, [state]);

  const toggleCategory = (cat) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const clearAll = () => setState({ categories: [], maxPrice: 300, minRating: 0, sort: "relevance" });

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) =>
      (state.categories.length === 0 || state.categories.includes(p.category)) &&
      p.price <= state.maxPrice &&
      p.rating >= state.minRating
    );
    if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [state]);

  const activeFilterChips = [
    ...state.categories.map((c) => ({ key: "cat-" + c, label: c, onRemove: () => toggleCategory(c) })),
    ...(state.maxPrice < 300 ? [{ key: "price", label: "Under $" + state.maxPrice, onRemove: () => setState((p) => ({ ...p, maxPrice: 300 })) }] : []),
    ...(state.minRating > 0 ? [{ key: "rating", label: state.minRating + "★ & up", onRemove: () => setState((p) => ({ ...p, minRating: 0 })) }] : []),
  ];

  return (
    <div className="wrap">
      <h1>Shop products</h1>
      <p className="sub">Filters sync to the URL query string — refresh or share the link and state persists.</p>
      <div className="layout">
        <aside className="filters">
          <h4>Category</h4>
          {CATEGORIES.map((c) => (
            <label className="chk" key={c}>
              <input type="checkbox" checked={state.categories.includes(c)} onChange={() => toggleCategory(c)} />
              {c}
            </label>
          ))}
          <h4>Max price</h4>
          <div className="priceRow">
            <input type="range" min="0" max="300" value={state.maxPrice}
              onChange={(e) => setState((p) => ({ ...p, maxPrice: Number(e.target.value) }))} />
            <span>${state.maxPrice}</span>
          </div>
          <h4>Minimum rating</h4>
          {[0, 3, 4, 5].map((r) => (
            <label className="chk" key={r}>
              <input type="radio" name="rating" checked={state.minRating === r} onChange={() => setState((p) => ({ ...p, minRating: r }))} />
              {r === 0 ? "Any" : "★".repeat(r) + " & up"}
            </label>
          ))}
          <button className="clearBtn" onClick={clearAll}>Clear all filters</button>
        </aside>
        <main className="main">
          <div className="topBar">
            <div className="count">{filtered.length} products found</div>
            <select value={state.sort} onChange={(e) => setState((p) => ({ ...p, sort: e.target.value }))}>
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
          {activeFilterChips.length > 0 && (
            <div className="chips">
              {activeFilterChips.map((chip) => (
                <div className="chip" key={chip.key}>{chip.label}<button onClick={chip.onRemove}>×</button></div>
              ))}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="empty">No products match your filters.</div>
          ) : (
            <div className="grid">
              {filtered.map((p) => (
                <div className="pcard" key={p.id}>
                  <div className="pimg">{p.emoji}</div>
                  <div className="pname">{p.name}</div>
                  <div className="pcat">{p.category} · {"★".repeat(p.rating)}</div>
                  <div className="pprice">${p.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


