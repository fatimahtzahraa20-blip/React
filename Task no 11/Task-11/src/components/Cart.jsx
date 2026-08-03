import useCartStore from "../store/cartStore";

function Cart() {
  const cart = useCartStore((state) => state.cart);
  const removeItem = useCartStore((state) => state.removeItem);

  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  return (
    <div className="cart">
      <h2 className="cart-title">🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h3>Your Cart is Empty</h3>
          <p>Add some products to get started.</p>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="price">${item.price}</p>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="summary">
            <div className="summary-row">
              <span>Total Items</span>
              <span>{cart.length}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>

            <button className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;