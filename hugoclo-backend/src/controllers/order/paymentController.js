// ============================================================
// Payment Controller — Xử lý callbacks từ VNPay và MoMo
// ============================================================

const Order = require("../../models/Order");
const Cart  = require("../../models/Cart");
const vnpay = require("../../services/vnpayService");
const momo  = require("../../services/momoService");

// ── Helpers ──────────────────────────────────────────────────
const { deductStock } = (() => {
  const Product = require("../../models/Product");
  const deductStock = async (items) => {
    await Promise.all(
      items.map(({ product, quantity }) =>
        Product.findByIdAndUpdate(product, {
          $inc: { stock: -quantity, sold: quantity },
        })
      )
    );
  };
  return { deductStock };
})();

// ─────────────────────────────────────────────────────────────
// GET /api/orders/vnpay-return
// VNPay redirect người dùng về đây sau khi thanh toán
// ─────────────────────────────────────────────────────────────
const vnpayReturn = async (req, res) => {
  try {
    const { isValid, responseCode, orderId, transactionId } = vnpay.verifyReturnUrl(req.query);

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";

    if (!isValid) {
      return res.redirect(`${frontendBase}/order-success?status=error&reason=invalid_signature`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.redirect(`${frontendBase}/order-success?status=error&reason=order_not_found`);
    }

    if (responseCode === "00") {
      // Thanh toán thành công
      order.paymentStatus  = "paid";
      order.orderStatus    = "confirmed";
      order.transactionId  = transactionId;
      await order.save();

      await deductStock(order.items);
      await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

      return res.redirect(`${frontendBase}/order-success?orderId=${orderId}&method=vnpay`);
    } else {
      // Thanh toán thất bại / hủy
      order.paymentStatus = "failed";
      order.orderStatus   = "cancelled";
      order.cancelReason  = `VNPay response code: ${responseCode}`;
      await order.save();

      return res.redirect(`${frontendBase}/order-success?status=failed&orderId=${orderId}`);
    }
  } catch (err) {
    console.error("[vnpayReturn]", err);
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendBase}/order-success?status=error`);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/orders/momo-ipn
// MoMo gửi IPN (server-to-server) để xác nhận thanh toán
// ─────────────────────────────────────────────────────────────
const momoIPN = async (req, res) => {
  try {
    const { isValid, resultCode, transactionId, orderId } = momo.verifyIPN(req.body);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (resultCode === 0) {
      order.paymentStatus = "paid";
      order.orderStatus   = "confirmed";
      order.transactionId = String(transactionId);
      await order.save();

      await deductStock(order.items);
      await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
    } else {
      order.paymentStatus = "failed";
      order.orderStatus   = "cancelled";
      order.cancelReason  = `MoMo result code: ${resultCode}`;
      await order.save();
    }

    // MoMo yêu cầu trả về 204 hoặc JSON xác nhận đã nhận
    res.status(204).end();
  } catch (err) {
    console.error("[momoIPN]", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/orders/momo-return
// MoMo redirect người dùng về sau khi thanh toán
// (chỉ dùng để frontend lấy status, IPN đã xử lý logic trên)
// ─────────────────────────────────────────────────────────────
const momoReturn = async (req, res) => {
  try {
    const { isValid, resultCode, transactionId, orderId } = momo.verifyIPN(req.query);
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";

    if (!isValid) {
      return res.redirect(`${frontendBase}/order-success?status=error&reason=invalid_signature`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.redirect(`${frontendBase}/order-success?status=error&reason=order_not_found`);
    }

    // Cập nhật đơn hàng ngay trên Return URL (cần thiết khi chạy localhost vì MoMo IPN không gọi được vào localhost)
    if (order.paymentStatus === "pending") {
      if (resultCode === 0) {
        order.paymentStatus = "paid";
        order.orderStatus   = "confirmed";
        order.transactionId = String(transactionId);
        await order.save();

        await deductStock(order.items);
        await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
      } else {
        order.paymentStatus = "failed";
        order.orderStatus   = "cancelled";
        order.cancelReason  = `MoMo result code: ${resultCode}`;
        await order.save();
      }
    }

    if (resultCode === 0) {
      return res.redirect(`${frontendBase}/order-success?orderId=${orderId}&method=momo`);
    }
    return res.redirect(`${frontendBase}/order-success?status=failed&orderId=${orderId}`);
  } catch (err) {
    console.error("[momoReturn]", err);
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendBase}/order-success?status=error`);
  }
};

module.exports = { vnpayReturn, momoIPN, momoReturn };
