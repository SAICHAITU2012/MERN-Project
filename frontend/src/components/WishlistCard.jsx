import { Link } from "react-router-dom";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const WishlistCard = ({ product, onRemove, removing }) => {
  const inStock = product.stock > 0;

  return (
    <article className="wishlist-card">
      <div className="wishlist-image-wrap">
        <img
          className="wishlist-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        <span className={`stock-badge ${inStock ? "in-stock" : "out-of-stock"}`}>
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </span>
      </div>

      <div className="wishlist-body">
        <span className="product-category">{product.category}</span>
        <h3 className="wishlist-product-name">{product.name}</h3>
        <p className="wishlist-price">{formatPrice(product.price)}</p>

        <div className="wishlist-actions">
          <Link
            id={`view-${product._id}`}
            className="main-button card-button"
            to={`/products/${product._id}`}
          >
            View Details
          </Link>
          <button
            id={`remove-${product._id}`}
            className="remove-button card-button"
            onClick={() => onRemove(product._id)}
            disabled={removing === product._id}
          >
            {removing === product._id ? "Removing..." : "♥ Remove"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default WishlistCard;
