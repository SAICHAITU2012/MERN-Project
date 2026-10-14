import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  createPaymentOrder as apiCreatePaymentOrder,
  verifyPayment as apiVerifyPayment
} from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

// ── Load Razorpay Checkout script dynamically ─────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true); // Already loaded
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Field-level validation ────────────────────────────────────
const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!/^\d{10}$/.test(form.phone.trim()))
    errors.phone = "Phone must be a valid 10-digit number.";
  if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";
  if (!/^\d{6}$/.test(form.pincode.trim()))
    errors.pincode = "Pincode must be exactly 6 digits.";
  return errors;
};

const Checkout = () => {
  const { cartItems, loading: cartLoading, subtotal, totalQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Redirect if cart is empty (guard)
  if (!cartLoading && cartItems.length === 0) {
    return (
      <main className="cart-page">
        <Navbar />
        <section className="cart-content">
          <div className="state-box wishlist-empty">
            <p className="state-icon">🛒</p>
            <p className="state-title">Your cart is empty</p>
            <p className="state-note">Add products before proceeding to checkout.</p>
            <Link className="main-button card-button" to="/products">Browse Products</Link>
          </div>
        </section>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    // ── 1. Client-side validation (skip API if basic data is bad) ─
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPlacing(true);

    try {
      // ── 2. Load Razorpay script ────────────────────────────────
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Check your internet connection.");
        setPlacing(false);
        return;
      }

      // ── 3. Create ShopKart pending order + Razorpay order ────────
      const data = await apiCreatePaymentOrder(form);

      // ── 4. Open Razorpay Standard Checkout ───────────────────────
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          // ── 5. Send payment credentials to backend for HMAC verification ──
          try {
            const result = await apiVerifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (result.success) {
              // ── 6. Clear global cart state → Navbar becomes Cart (0) ──
              clearCart();
              // ── 7. Navigate to success page ──────────────────────────
              navigate(`/order-success/${result.order._id}`);
            } else {
              setError("Payment verification failed. Your cart has not been cleared.");
              setPlacing(false);
            }
          } catch (verifyErr) {
            const msg = verifyErr.response?.data?.message || "Payment verification failed.";
            setError(msg + " Your cart has not been cleared. Please try again.");
            setPlacing(false);
          }
        },

        prefill: {
          name: form.fullName,
          contact: form.phone
        },

        theme: { color: "#2f6f5e" },

        modal: {
          ondismiss: () => {
            // User closed the Razorpay modal without paying
            setPlacing(false);
            setError("Payment was cancelled. Your cart has not been modified.");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}. Your cart has not been cleared.`);
        setPlacing(false);
      });

      paymentObject.open();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
      setPlacing(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma", type: "text" },
    { name: "phone", label: "Phone Number", placeholder: "9876543210", type: "tel" },
    { name: "addressLine1", label: "Address", placeholder: "22 MG Road, Apt 3B", type: "text" },
    { name: "city", label: "City", placeholder: "Bengaluru", type: "text" },
    { name: "state", label: "State", placeholder: "Karnataka", type: "text" },
    { name: "pincode", label: "Pincode", placeholder: "560001", type: "text" }
  ];

  return (
    <main className="checkout-page">
      <Navbar />

      <section className="checkout-content">
        <div className="checkout-head">
          <p className="eyebrow">ShopKart</p>
          <h1>Checkout</h1>
          <Link className="back-link" to="/cart">← Back to Cart</Link>
        </div>

        <div className="checkout-layout">
          {/* ── Left: Shipping Form ── */}
          <div className="checkout-form-section">
            <h2 className="section-heading">Shipping Details</h2>

            <form id="checkout-form" className="checkout-form" onSubmit={handlePlaceOrder} noValidate>
              {fields.map(({ name, label, placeholder, type }) => (
                <div key={name} className="form-group">
                  <label className="form-label" htmlFor={`field-${name}`}>
                    {label} <span className="required-star">*</span>
                  </label>
                  <input
                    id={`field-${name}`}
                    name={name}
                    type={type}
                    className={`form-input ${fieldErrors[name] ? "input-error" : ""}`}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    disabled={placing}
                  />
                  {fieldErrors[name] && (
                    <p className="field-error">{fieldErrors[name]}</p>
                  )}
                </div>
              ))}

              {error && (
                <div className="checkout-error-box">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                id="place-order-btn"
                type="submit"
                className="main-button checkout-btn place-order-btn"
                disabled={placing || cartLoading}
              >
                {placing ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" /> Processing...
                  </span>
                ) : (
                  `Pay ${formatPrice(subtotal)}`
                )}
              </button>
            </form>
          </div>

          {/* ── Right: Order Summary ── */}
          <aside className="order-summary checkout-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-rows">
              {cartItems.map((item) => (
                <div key={item.product._id} className="summary-row">
                  <div className="summary-item-info">
                    <img
                      className="summary-item-img"
                      src={item.product.image}
                      alt={item.product.name}
                    />
                    <span className="summary-item-name">
                      {item.product.name}
                      <span className="summary-qty"> × {item.quantity}</span>
                    </span>
                  </div>
                  <span className="summary-item-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span className="summary-total-label">
                Total ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
              </span>
              <span className="summary-total-price">{formatPrice(subtotal)}</span>
            </div>

            <p className="secure-note">🔒 Secured by Razorpay Test Mode</p>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Checkout;
