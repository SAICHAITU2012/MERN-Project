import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, "../frontend/dist");
// Production mode: Express also serves the built frontend when it exists.
const hasFrontendBuild = fs.existsSync(path.join(frontendDist, "index.html"));

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

// All API routes live on one router. It is always mounted at /api (what the
// frontend calls in production) and additionally at the root for requests
// that are not browser navigations — the Vite dev proxy strips the /api
// prefix before forwarding, and direct API consumers (curl, tests) use bare
// paths too. Browser navigations skip the root mount so client-side routes
// like /orders/:id render the SPA instead of the API handler.
const api = express.Router();
api.get("/health", (req, res) => {
  res.json({ success: true, message: "ShopKart API is running" });
});
api.use("/customers", customerRoutes);
api.use("/products", productRoutes);
api.use("/wishlist", wishlistRoutes);
api.use("/cart", cartRoutes);
api.use("/orders", orderRoutes);

app.use("/api", api);

app.use((req, res, next) => {
  if (req.method === "GET" && req.headers.accept?.includes("text/html")) {
    return next();
  }
  api(req, res, next);
});

if (hasFrontendBuild) {
  app.use(express.static(frontendDist));

  // SPA fallback: client-side routes like /products or /orders/:id have no
  // file on disk, so serve index.html for browser navigations.
  app.use((req, res, next) => {
    if (req.method !== "GET" || !req.headers.accept?.includes("text/html")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ success: true, message: "ShopKart API is running" });
  });
}

// Vercel deploys this app as a serverless function by importing the default
// export — it never binds a port, so listening is skipped there.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });

export default app;
