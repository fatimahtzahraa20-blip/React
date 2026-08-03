import useCartStore from "../store/cartStore";

const products = [
  { id: 1, name: "Laptop", price: 1000 },
  { id: 2, name: "Phone", price: 500 },
  { id: 3, name: "Headphones", price: 100 },
];

function ProductList() {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div>
      <h2>Products</h2>

      {products.map((product) => (
        <div key={product.id} className="card">
          <h3>{product.name}</h3>
          <p>${product.price}</p>

          <button onClick={() => addItem(product)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;