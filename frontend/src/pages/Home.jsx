import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Home = () => {
  const { customer } = useAuth();

  return (
    <main className="home-page">
      <Navbar />
      <section className="home-content">
        <div>
          <p className="eyebrow">ShopKart Home</p>
          <h1>Welcome, {customer.fullName}</h1>
          <p className="home-note">Your account is active. Start exploring the latest products.</p>
          <Link className="main-button home-cta" to="/products">Shop Now</Link>
        </div>

        <div className="profile-box">
          <h2>Customer Profile</h2>
          <div className="profile-row">
            <span>Name</span>
            <strong>{customer.fullName}</strong>
          </div>
          <div className="profile-row">
            <span>Email</span>
            <strong>{customer.email}</strong>
          </div>
          <div className="profile-row">
            <span>Phone</span>
            <strong>{customer.phone}</strong>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
