import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { toggleWishlist } from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const ProductCard = ({ product, initialSaved = false }) => {
  const inStock = product.stock > 0;

  // ── Wishlist state (local — uses toggle API directly) ────.  
  const [saved, setSaved] = useState(initialSaved);
  const [wishlistStatus, setWishlistStatus] = useState("idle");
  const [wishlistError, setWishlistError] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!hasInteracted) {
      setSaved(initialSaved);
    }
  }, [initialSaved, hasInteracted]);

  const handleWishlistToggle = async () => {
    if (wishlistStatus === "saving") return;
    setHasInteracted(true);
    setWishlistStatus("saving");
    setWishlistError("");
    try {
      const data = await toggleWishlist(product._id);
      setSaved(data.saved);
      setWishlistStatus("idle");
    } catch {
      setWishlistStatus("error");
      setWishlistError("Unable to save. Try again.");
    }
  };

  // ── Cart state (from global CartContext) ─────────────────
  const { addItem, isInCart, isActionLoading } = useCart();
  const inCart = isInCart(product._id);
  const cartBusy = isActionLoading(product._id);
  const [cartError, setCartError] = useState("");

  const handleAddToCart = async () => {
    if (cartBusy || !inStock) return;
    setCartError("");
    const result = await addItem(product._id);
    if (!result.success) {
      setCartError(result.message || "Unable to add to cart.");
    }
  };

  const cartLabel = () => {
    if (cartBusy) return "Adding...";
    if (inCart) return "🛒 Add Another";
    return "Add to Cart";
  };

  const wishlistLabel = () => {
    if (wishlistStatus === "saving") return "⏳ Saving...";
    if (saved) return "♥ Remove from Wishlist";
    return "♡ Add to Wishlist";
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        <span className={`stock-badge ${inStock ? "in-stock" : "out-of-stock"}`}>
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </span>
        <button
          className={`wishlist-heart-btn ${saved ? "saved" : ""}`}
          onClick={handleWishlistToggle}
          disabled={wishlistStatus === "saving"}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          title={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>

        {wishlistStatus === "error" && (
          <p className="wishlist-error-inline">{wishlistError}</p>
        )}
        {cartError && (
          <p className="wishlist-error-inline">{cartError}</p>
        )}

        <div className="card-actions">
          <Link className="main-button card-button" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button
            id={`cart-btn-${product._id}`}
            className={`outline-button card-button ${inCart ? "in-cart-outline" : ""}`}
            onClick={handleAddToCart}
            disabled={cartBusy || !inStock}
          >
            {cartLabel()}
          </button>
          <button
            id={`wishlist-btn-${product._id}`}
            className={`outline-button card-button ${saved ? "saved-outline" : ""}`}
            onClick={handleWishlistToggle}
            disabled={wishlistStatus === "saving"}
          >
            {wishlistLabel()}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
