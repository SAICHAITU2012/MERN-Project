<div align="center">

# 🛒 ShopKart

**A full-stack MERN e-commerce application**

Browse a product catalog, manage a wishlist and cart, and pay through Razorpay —
with JWT authentication, role-free protected routes, and a persistent order history.

`Node.js` · `Express` · `MongoDB` · `Mongoose` · `React 19` · `React Router 7` · `Vite` · `Razorpay`

</div>

---

## ✨ Features

**Authentication**
- Register / login / logout / view profile / change password
- Passwords hashed with **bcrypt**, sessions via **JWT stored in an httpOnly cookie** (immune to localStorage-based XSS)
- Route guards on the client: `ProtectedRoute` redirects logged-out users, `PublicRoute` bounces logged-in users away from `/login` and `/register`

**Product catalog**
- Product listing with cards, **live debounced search**, category filter, and price sorting (asc / desc)
- Product details page for every item
- Loading, error, and empty states everywhere data is fetched

**Wishlist & cart**
- Toggle any product in/out of the wishlist with one click
- Add to cart, update quantity, remove items — cart persists per user in MongoDB
- Navbar shows live wishlist / cart counts from global context state

**Checkout & payments (Razorpay — test mode)**
- Shipping form with client-side validation (10-digit phone, 6-digit pincode)
- Order total is **calculated on the server**, never trusted from the client
- Real Razorpay Standard Checkout flow: create payment order → open modal →
  **HMAC signature verified server-side** → order marked `PAID`
- Product name/price snapshots stored on each order, so later catalog edits never rewrite history

**Orders**
- Order list + order details pages
- Lifecycle: `PENDING_PAYMENT → PLACED → CONFIRMED → SHIPPED → DELIVERED`
- Bonus endpoint to update an order's status

## 🧱 Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5 (MVC structure) |
| Database | MongoDB Atlas / local, via Mongoose 9 |
| Auth | JWT (`jsonwebtoken`) in httpOnly cookies, bcrypt hashing |
| Payments | Razorpay Node SDK + Standard Checkout |
| Frontend | React 19, React Router 7, Axios |
| Build tool | Vite |

## 🚀 Getting started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or a local instance)
- **Razorpay test keys** (optional) — only needed to exercise the checkout flow

### 1. Clone & install

```bash
git clone https://github.com/SAICHAITU2012/MERN-Project.git
cd MERN-Project

# Backend
cd backend
npm install

# Frontend (in a second terminal)
cd frontend
npm install
```

### 2. Configure environment variables

Copy the template and fill in your values — **never commit your real `.env`**:

```bash
cd backend
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | – | Backend port (defaults to `8080`) |
| `MONGO_URI` | ✅ | Local or Atlas connection string |
| `JWT_SECRET` | ✅ | Long random string used to sign auth tokens |
| `RAZORPAY_KEY_ID` | checkout only | Razorpay **test-mode** key id |
| `RAZORPAY_KEY_SECRET` | checkout only | Razorpay **test-mode** key secret |

> The backend starts fine without Razorpay keys — payment endpoints report that
> keys are not configured until you add test keys.

### 3. Seed the catalog & run

```bash
# inside backend/
npm run seed          # wipes the products collection and inserts 10 sample products
npm run dev           # API on http://localhost:8080
```

```bash
# inside frontend/
npm run dev           # app on http://localhost:5173
```

Open **http://localhost:5173**, register an account, and start shopping.

## 🏗️ Project structure

```text
backend/
├── config/razorpay.js          # lazy Razorpay client (no startup crash without keys)
├── controllers/                # customer, product, wishlist, cart, order
├── middlewares/                 # isAuthenticated (JWT cookie)
├── models/                     # Customer, Product, Order schemas
├── routes/                     # /customers /products /wishlist /cart /orders
├── utils/
│   ├── generateToken.js
│   ├── seedProducts.js         # npm run seed
│   └── migrateToAtlas.js       # one-time local → Atlas copy helper
└── index.js

frontend/src/
├── components/                 # Navbar, ProductCard, WishlistCard, CartItem,
│                               # SearchBar, ProtectedRoute, PublicRoute
├── context/                    # AuthContext, CartContext
├── pages/                      # Login, Register, Home, Products, ProductDetails,
│                               # Wishlist, Cart, Checkout, OrderSuccess,
│                               # Orders, OrderDetails
├── services/api.js             # axios instance (withCredentials) + all API calls
└── main.jsx / App.jsx          # routes
```

## 🔌 API reference

Base URL: `http://localhost:8080` — the Vite dev server proxies `/api/*` to it
(stripping the prefix), so page routes like `/products` never collide with API paths.

All protected endpoints require the auth cookie set by login. 🔒 = protected

### Customers — `/customers`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/customers/register` | – | Create account |
| POST | `/customers/login` | – | Login, sets JWT cookie |
| GET | `/customers/me` | 🔒 | Current profile |
| POST | `/customers/logout` | 🔒 | Clear cookie |
| PATCH | `/customers/change-password` | 🔒 | Change password |

### Products — `/products`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/products` | – | List products |
| GET | `/products/:id` | – | Single product |
| POST | `/products` | – | Create product |

Query parameters on `GET /products`:

- `search=phone` — case-insensitive match on name
- `category=Electronics` — exact category filter
- `sort=price_asc` / `sort=price_desc`

```bash
GET /products?search=phone&category=Electronics&sort=price_desc
```

Create body:

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://example.com/keyboard.jpg",
  "stock": 10
}
```

### Wishlist — `/wishlist` (all 🔒)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/wishlist` | List wishlisted products |
| POST | `/wishlist/:productId` | Add |
| DELETE | `/wishlist/:productId` | Remove |
| PATCH | `/wishlist/:productId/toggle` | Toggle add/remove |

### Cart — `/cart` (all 🔒)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/cart` | Cart with populated products + subtotal |
| POST | `/cart/:productId` | Add product (or bump quantity) |
| PATCH | `/cart/:productId` | Set quantity — body: `{ "quantity": 3 }` |
| DELETE | `/cart/:productId` | Remove product |

### Orders — `/orders` (all 🔒)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/orders/create-payment-order` | Create pending order + Razorpay order — body: `{ "shippingAddress": {...} }` |
| POST | `/orders/verify-payment` | Verify Razorpay HMAC signature, mark order `PAID` |
| GET | `/orders` | Current user's orders |
| GET | `/orders/:id` | Order details |
| PATCH | `/orders/:id/status` | Update lifecycle status (bonus) |

## 🖥️ Frontend routes

| Route | Access | Page |
|---|---|---|
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/home` | Protected | Home |
| `/products` | Protected | Product listing |
| `/products/:id` | Protected | Product details |
| `/wishlist` | Protected | Wishlist |
| `/cart` | Protected | Cart |
| `/checkout` | Protected | Checkout (shipping + payment) |
| `/order-success/:id` | Protected | Order confirmation |
| `/orders` | Protected | Order history |
| `/orders/:id` | Protected | Order details |

## 💳 Testing payments

With **Razorpay test keys** configured, checkout opens the Razorpay test modal.
Use Razorpay's test payment methods — e.g. card `4111 1111 1111 1111` (any future
expiry / CVV) or the test UPI `success@razorpay`. No real money moves in test mode.

## 📦 Deployment (optional)

Deployment is not required for this submission, but the app deploys cleanly:

- **Backend** → Render / Railway / Fly.io (set the env vars above in the dashboard)
- **Database** → MongoDB Atlas free tier (whitelist the host's egress IP)
- **Frontend** → `npm run build`, host `dist/` on Vercel / Netlify; proxy `/api/*`
  to the backend (Vercel rewrites / Netlify redirects) or point the axios `baseURL`
  in `frontend/src/services/api.js` at the backend's public URL

## 🔐 Security notes

- `backend/.env` is git-ignored — this repo ships only `.env.example` with placeholders
- The Razorpay key secret never leaves the backend; the client only receives the public key id
- Payment verification recomputes and compares the HMAC signature server-side
- Order totals are recomputed server-side from the database, never taken from the client
- Sessions use httpOnly cookies, so tokens are not readable from JavaScript

---

<div align="center">

*Built as a full-stack MERN coursework project — labs 01–05: auth → catalog → wishlist → cart → payments.*

</div>
