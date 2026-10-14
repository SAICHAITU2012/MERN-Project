import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const validate = () => {
    if (!form.fullName || !form.email || !form.password || !form.phone) {
      return "Please fill all fields";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = validate();
    setError(message);

    if (message) {
      return;
    }

    setSaving(true);

    try {
      await api.post("/customers/register", form);
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <section className="auth-box">
        <div className="auth-head">
          <h1>Create account</h1>
          <p>Join ShopKart and keep your shopping profile ready.</p>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" />
          </label>

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@gmail.com" />
          </label>

          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="john123" />
          </label>

          <label>
            Phone Number
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
          </label>

          <button className="main-button" disabled={saving}>
            {saving ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
