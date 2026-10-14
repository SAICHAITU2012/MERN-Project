import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import WishlistCard from "../components/WishlistCard.jsx";
import { getWishlist, removeFromWishlist } from "../services/api.js";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null); // product._id being removed

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWishlist();
      setWishlist(data.wishlist);
    } catch {
      setError("Something went wrong. We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      // Silently retry — user can try again
    } finally {
      setRemoving(null);
    }
  };

  return (
    <main className="wishlist-page">
      <Navbar wishlistCount={wishlist.length} />

      <section className="wishlist-content">
        <div className="wishlist-head">
          <p className="eyebrow">My Wishlist</p>
          <h1>Saved Products</h1>
          {!loading && !error && wishlist.length > 0 && (
            <p className="wishlist-count-text">
              {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-box">
            <div className="spinner" aria-label="Loading"></div>
            <p className="state-title">Loading your wishlist...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-box state-error">
            <p className="state-icon">⚠️</p>
            <p className="state-title">Something went wrong.</p>
            <p className="state-note">{error}</p>
            <button
              id="retry-wishlist"
              className="main-button card-button"
              onClick={fetchWishlist}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="state-box wishlist-empty">
            <p className="state-icon">❤️</p>
            <p className="state-title">Your wishlist is empty</p>
            <p className="state-note">
              Save products you love and find them here later.
            </p>
            <Link
              id="browse-products-link"
              className="main-button card-button"
              to="/products"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                removing={removing}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Wishlist;
