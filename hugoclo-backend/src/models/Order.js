// ============================================================
// Order Model — Lưu trữ thông tin đơn hàng
// ============================================================

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name:     { type: String, required: true },   // snapshot tại thời điểm đặt
    image:    { type: String, default: "" },       // snapshot ảnh đầu tiên
    price:    { type: Number, required: true },    // giá tại thời điểm đặt
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    address:  { type: String, required: true },   // số nhà, tên đường
    ward:     { type: String, default: "" },       // phường/xã
    district: { type: String, required: true },
    city:     { type: String, required: true },
    note:     { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // ── Người dùng ─────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Danh sách sản phẩm (snapshot) ──────────────────────
    items: [orderItemSchema],

    // ── Địa chỉ giao hàng ──────────────────────────────────
    shippingAddress: { type: shippingAddressSchema, required: true },

    // ── Tài chính ──────────────────────────────────────────
    subtotal:     { type: Number, required: true },
    shippingFee:  { type: Number, default: 30000 },
    discountAmt:  { type: Number, default: 0 },
    couponCode:   { type: String, default: "" },
    totalAmount:  { type: Number, required: true },

    // ── Thanh toán ─────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay", "momo"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // IDs từ cổng thanh toán
    transactionId: { type: String, default: "" },   // vnpay / momo transaction ref
    paymentRef:    { type: String, default: "" },   // vnpTxnRef hoặc momo orderId

    // ── Trạng thái đơn ─────────────────────────────────────
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },

    cancelReason: { type: String, default: "" },

    // ── Lưu trữ ────────────────────────────────────────────
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentRef: 1 }, { sparse: true });

module.exports = mongoose.model("Order", orderSchema);
