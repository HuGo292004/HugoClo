const express = require("express");
const cors = require("cors");

const app = express();
const authRoutes    = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes  = require("./routes/productRoutes");
const cartRoutes     = require("./routes/cartRoutes");
const reviewRoutes   = require("./routes/reviewRoutes");
const orderRoutes    = require('./routes/orderRoutes');
const userRoutes     = require('./routes/userRoutes');

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Lấy từ file .env
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true, // Quan trọng nếu bạn có dùng cookie/session
}));
app.use(express.json());
app.use("/api/auth",       authRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/products",   reviewRoutes);   // nested: /api/products/:id/reviews
app.use("/api/carts",      cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/user',       userRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the HugoClo API");
});

module.exports = app;
