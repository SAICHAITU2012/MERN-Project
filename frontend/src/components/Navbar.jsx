import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Navbar = ({ wishlistCount }) => {
  const { customer, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link className="brand" to="/home">ShopKart</Link>
        <Link className="nav-link" to="/home">Home</Link>
        <Link className="nav-link" to="/products">Products</Link>
        <Link className="nav-link wishlist-nav-link" to="/wishlist" id="nav-wishlist">
          Wishlist
          {typeof wishlistCount === "number" && wishlistCount > 0 && (
            <span className="wishlist-count-badge">{wishlistCount}</span>
          )}
        </Link>
        <Link className="nav-link wishlist-nav-link" to="/cart" id="nav-cart">
          Cart
          {totalQuantity > 0 && (
            <span className="cart-count-badge">{totalQuantity}</span>
          )}
        </Link>
        <Link className="nav-link" to="/orders" id="nav-orders">
          My Orders
        </Link>
      </div>
      {customer && (
        <button className="small-button" onClick={handleLogout}>Logout</button>
      )}
    </nav>
  );
};

export default Navbar;
