import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem.jsx";
import Navbar from "../components/Navbar.jsx";
import { useCart } from "../context/CartContext.jsx";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const Cart = () => {
  const { cartItems, loading, error, totalQuantity, subtotal, loadCart } = useCart();
  const navigate = useNavigate();

  return (
    <main className="cart-page">
      <Navbar />

      <section className="cart-content">
        <div className="cart-head">
          <p className="eyebrow">ShopKart</p>
          <h1>My Cart</h1>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="state-box">
            <div className="spinner" aria-label="Loading"></div>
            <p className="state-title">Loading your cart...</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="state-box state-error">
            <p className="state-icon">⚠️</p>
            <p className="state-title">Unable to load your cart.</p>
            <p className="state-note">{error}</p>
            <button
              id="retry-cart"
              className="main-button card-button"
              onClick={loadCart}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="state-box wishlist-empty">
            <p className="state-icon">🛒</p>
            <p className="state-title">Your cart is empty</p>
            <p className="state-note">
              Looks like you haven't added anything yet.
            </p>
            <Link
              id="browse-products-from-cart"
              className="main-button card-button"
              to="/products"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* ── Cart items + order summary ── */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">
            {/* Items list */}
            <div className="cart-items-section">
              <p className="result-count">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"} in your cart
              </p>
              <ul className="cart-list">
                {cartItems.map((item) => (
                  <CartItem key={item.product._id} item={item} />
                ))}
              </ul>
            </div>

            {/* Order summary sidebar */}
            <aside className="order-summary">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-rows">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="summary-row">
                    <span className="summary-item-name">
                      {item.product.name}
                      <span className="summary-qty"> × {item.quantity}</span>
                    </span>
                    <span className="summary-item-price">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <span className="summary-total-label">
                  Subtotal ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
                </span>
                <span className="summary-total-price">{formatPrice(subtotal)}</span>
              </div>

              <button
                id="proceed-checkout"
                className="main-button checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <Link className="continue-shopping-link" to="/products">
                ← Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
};

export default Cart;
