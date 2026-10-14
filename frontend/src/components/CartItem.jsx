import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const CartItem = ({ item }) => {
  const { product, quantity } = item;
  const { updateItem, removeItem, isActionLoading } = useCart();
  const busy = isActionLoading(product._id);
  const [error, setError] = useState("");

  const handleIncrease = async () => {
    setError("");
    const result = await updateItem(product._id, quantity + 1);
    if (!result.success) setError(result.message || "Cannot increase quantity.");
  };

  const handleDecrease = async () => {
    if (quantity <= 1) return; // Use Remove for the last unit
    setError("");
    const result = await updateItem(product._id, quantity - 1);
    if (!result.success) setError(result.message || "Cannot decrease quantity.");
  };

  const handleRemove = async () => {
    setError("");
    await removeItem(product._id);
  };

  const lineTotal = product.price * quantity;
  const atStockLimit = quantity >= product.stock;

  return (
    <li className="cart-item">
      <div className="cart-item-image-wrap">
        <img
          className="cart-item-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
      </div>

      <div className="cart-item-body">
        <div className="cart-item-top">
          <div>
            <span className="product-category">{product.category}</span>
            <h3 className="cart-item-name">{product.name}</h3>
            <p className="cart-item-unit-price">{formatPrice(product.price)} each</p>
          </div>
          <p className="cart-item-line-total">{formatPrice(lineTotal)}</p>
        </div>

        {error && <p className="wishlist-error-inline">{error}</p>}

        <div className="cart-item-controls">
          <div className="qty-controls">
            <button
              id={`qty-dec-${product._id}`}
              className="qty-btn"
              onClick={handleDecrease}
              disabled={busy || quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-value" aria-live="polite">{quantity}</span>
            <button
              id={`qty-inc-${product._id}`}
              className="qty-btn"
              onClick={handleIncrease}
              disabled={busy || atStockLimit}
              title={atStockLimit ? `Max stock: ${product.stock}` : ""}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="cart-item-actions">
            <Link
              className="cart-view-link"
              to={`/products/${product._id}`}
            >
              View Details
            </Link>
            <button
              id={`remove-cart-${product._id}`}
              className="remove-button cart-remove-btn"
              onClick={handleRemove}
              disabled={busy}
            >
              {busy ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>

        {atStockLimit && !busy && (
          <p className="stock-limit-note">Max available: {product.stock} units</p>
        )}
      </div>
    </li>
  );
};

export default CartItem;
