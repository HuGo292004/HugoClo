// ============================================================
// Order Routes
// ============================================================

const express = require("express");
const router  = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  createOrder, getMyOrders, getOrderById, cancelOrder,
  getAllOrdersAdmin, updateOrderStatus,
} = require("../controllers/order/orderController");
const {
  vnpayReturn, momoIPN, momoReturn,
} = require("../controllers/order/paymentController");

// ── Payment callbacks (đầu không cần auth — cổng thanh toán gọi trực tiếp) ──
router.get( "/vnpay-return",  vnpayReturn);
router.post("/momo-ipn",      momoIPN);
router.get( "/momo-return",   momoReturn);

// ── [ADMIN] Quản lý đơn hàng ──────────────────────────────
router.get( "/admin/all",              protect, adminOnly, getAllOrdersAdmin);
router.put( "/admin/:id/status",       protect, adminOnly, updateOrderStatus);

// ── Order CRUD (cần đăng nhập) ────────────────────────────
router.post("/",          protect, createOrder);
router.get( "/",          protect, getMyOrders);
router.get( "/:id",       protect, getOrderById);
router.put( "/:id/cancel",protect, cancelOrder);

module.exports = router;
