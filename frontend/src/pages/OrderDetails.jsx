import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getOrderById } from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        const msg = err.response?.status === 403
          ? "You don't have permission to view this order."
          : "Order not found.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  return (
    <main className="orders-page">
      <Navbar />

      <section className="orders-content">
        <div className="orders-head">
          <Link className="back-link" to="/orders">← My Orders</Link>
          <h1>Order Details</h1>
        </div>

        {loading && (
          <div className="state-box">
            <div className="spinner" />
            <p className="state-title">Loading order...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box state-error">
            <p className="state-icon">⚠️</p>
            <p className="state-title">{error}</p>
            <Link className="main-button card-button" to="/orders">Back to Orders</Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="order-detail-card">
            {/* Header */}
            <div className="order-detail-head">
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

            {/* Items */}
            <div className="order-detail-section">
              <h2 className="detail-section-title">Items Ordered</h2>
              {order.items.map((item, i) => (
                <div key={i} className="order-detail-item">
                  {item.image && (
                    <img className="order-detail-img" src={item.image} alt={item.name} />
                  )}
                  <div className="order-detail-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-unit-price">
                      {formatPrice(item.price)} each × {item.quantity}
                    </p>
                  </div>
                  <p className="order-item-line-total">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="order-detail-total">
                <span>Total</span>
                <span className="order-total-price">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Shipping */}
            <div className="order-detail-section">
              <h2 className="detail-section-title">Shipping Address</h2>
              <div className="shipping-detail">
                <p className="shipping-name">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p>📞 {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment info */}
            {order.razorpayPaymentId && (
              <div className="order-detail-section">
                <h2 className="detail-section-title">Payment Reference</h2>
                <p className="mono">{order.razorpayPaymentId}</p>
              </div>
            )}

            <div className="order-detail-actions">
              <Link className="main-button card-button" to="/orders">Back to Orders</Link>
              <Link className="outline-button card-button" to="/products">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default OrderDetails;
