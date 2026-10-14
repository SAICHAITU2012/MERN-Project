import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getOrders, updateOrderStatus } from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

// Bonus: status progression labels
const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const OrderCard = ({ order, onStatusUpdate }) => {
  const [advancing, setAdvancing] = useState(false);

  const currentIdx = STATUS_STEPS.indexOf(order.status);
  const nextStatus = STATUS_STEPS[currentIdx + 1];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setAdvancing(true);
    try {
      const data = await updateOrderStatus(order._id, nextStatus);
      onStatusUpdate(data.order);
    } catch {
      /* silent */
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <article className="order-card">
      <div className="order-card-head">
        <div>
          <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
          <p className="order-date">{formatDate(order.createdAt)}</p>
        </div>
        <div className="order-badges">
          <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
            {order.status}
          </span>
          <span className={`payment-badge payment-${order.paymentStatus.toLowerCase()}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="order-card-items">
        {order.items.map((item, i) => (
          <div key={i} className="order-item-row">
            {item.image && (
              <img className="order-item-img" src={item.image} alt={item.name} />
            )}
            <span className="order-item-name">
              {item.name} × {item.quantity}
            </span>
            <span className="order-item-price">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="order-card-footer">
        <span className="order-total">Total: {formatPrice(order.totalAmount)}</span>
        <div className="order-card-actions">
          {/* Bonus: advance status */}
          {nextStatus && order.paymentStatus === "PAID" && (
            <button
              className="outline-button card-button status-advance-btn"
              onClick={handleAdvance}
              disabled={advancing}
            >
              {advancing ? "Updating..." : `Mark ${nextStatus}`}
            </button>
          )}
          <Link
            id={`view-order-${order._id}`}
            className="main-button card-button"
            to={`/orders/${order._id}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      setOrders(data.orders);
    } catch {
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );
  };

  return (
    <main className="orders-page">
      <Navbar />

      <section className="orders-content">
        <div className="orders-head">
          <p className="eyebrow">ShopKart</p>
          <h1>My Orders</h1>
        </div>

        {/* Loading */}
        {loading && (
          <div className="state-box">
            <div className="spinner" />
            <p className="state-title">Loading your orders...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="state-box state-error">
            <p className="state-icon">⚠️</p>
            <p className="state-title">{error}</p>
            <button className="main-button card-button" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="state-box wishlist-empty">
            <p className="state-icon">📦</p>
            <p className="state-title">No orders yet</p>
            <p className="state-note">You haven't placed any orders yet.</p>
            <Link className="main-button card-button" to="/products">
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            <p className="result-count">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Orders;
