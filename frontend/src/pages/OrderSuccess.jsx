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
    year: "numeric"
  });

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch {
        setError("Could not load order details.");
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
        {loading && (
          <div className="state-box">
            <div className="spinner" />
            <p className="state-title">Loading order details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box state-error">
            <p className="state-icon">⚠️</p>
            <p className="state-title">{error}</p>
            <Link className="main-button card-button" to="/orders">My Orders</Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h1 className="success-title">Order Placed Successfully!</h1>
            <p className="success-subtitle">
              Thank you for your purchase. Your order has been confirmed.
            </p>

            <div className="success-meta">
              <div className="success-row">
                <span className="success-label">Order ID</span>
                <span className="success-value mono">{order._id}</span>
              </div>
              <div className="success-row">
                <span className="success-label">Date</span>
                <span className="success-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="success-row">
                <span className="success-label">Status</span>
                <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="success-row">
                <span className="success-label">Payment</span>
                <span className={`payment-badge payment-${order.paymentStatus.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="success-items">
              <h3 className="success-section-title">Items Ordered</h3>
              {order.items.map((item, i) => (
                <div key={i} className="success-item-row">
                  {item.image && (
                    <img className="success-item-img" src={item.image} alt={item.name} />
                  )}
                  <span className="success-item-name">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="success-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="success-total">
              <span>Total Paid</span>
              <span className="success-total-price">{formatPrice(order.totalAmount)}</span>
            </div>

            <div className="success-shipping">
              <h3 className="success-section-title">Shipping To</h3>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                {order.shippingAddress.pincode}
              </p>
              <p>📞 {order.shippingAddress.phone}</p>
            </div>

            <div className="success-actions">
              <Link id="view-orders-btn" className="main-button card-button" to="/orders">
                View My Orders
              </Link>
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

export default OrderSuccess;
