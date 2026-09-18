// ============================================================
// Order Controller — CRUD đơn hàng
// ============================================================

const Order   = require("../../models/Order");
const Cart    = require("../../models/Cart");
const Product = require("../../models/Product");
const vnpay   = require("../../services/vnpayService");
const momo    = require("../../services/momoService");

// ─────────────────────────────────────────────────────────────
// POST /api/orders
// Tạo đơn hàng mới từ giỏ hàng hiện tại
// ─────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, discountAmt } = req.body;

    // 1. Lấy giỏ hàng của user, populate thông tin product
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // 2. Snapshot items (lưu giá tại thời điểm đặt)
    const orderItems = cart.items.map((item) => ({
      product:  item.product._id,
      name:     item.product.name,
      image:    item.product.images?.[0] || "",
      price:    item.product.price,
      quantity: item.quantity,
    }));

    // 3. Tính tổng tiền
    const subtotal    = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const discount    = Number(discountAmt) || 0;
    const totalAmount = subtotal - discount + shippingFee;

    // 4. Tạo đơn hàng
    const order = await Order.create({
      user:            req.user.id,
      items:           orderItems,
      shippingAddress,
      paymentMethod,
      couponCode:      couponCode || "",
      subtotal,
      shippingFee,
      discountAmt:     discount,
      totalAmount,
    });

    // 5. Xử lý theo phương thức thanh toán
    if (paymentMethod === "cod") {
      // COD: xác nhận đơn ngay, trừ stock, xóa giỏ hàng
      await deductStock(orderItems);
      await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

      return res.status(201).json({
        success: true,
        order,
        redirectUrl: null,  // COD không cần redirect
      });
    }

    if (paymentMethod === "vnpay") {
      const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const paymentUrl = vnpay.createPaymentUrl({
        orderId:   order._id.toString(),
        amount:    totalAmount,
        orderInfo: `Thanh toan don hang HugoClo #${order._id.toString().slice(-6).toUpperCase()}`,
        ipAddr,
      });

      return res.status(201).json({
        success:     true,
        order,
        redirectUrl: paymentUrl,
      });
    }

    if (paymentMethod === "momo") {
      const paymentUrl = await momo.createPaymentUrl({
        orderId:   order._id.toString(),
        amount:    totalAmount,
        orderInfo: `Thanh toan don hang HugoClo #${order._id.toString().slice(-6).toUpperCase()}`,
      });

      return res.status(201).json({
        success:     true,
        order,
        redirectUrl: paymentUrl,
      });
    }

    res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
  } catch (err) {
    console.error("[createOrder]", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/orders
// Lấy danh sách đơn hàng của user hiện tại
// ─────────────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ user: req.user.id }),
    ]);

    res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/orders/:id
// Chi tiết đơn hàng (chỉ user sở hữu hoặc admin)
// ─────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "name images price");
    if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

    // Kiểm tra quyền
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền xem đơn hàng này" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/orders/:id/cancel
// Hủy đơn hàng (chỉ khi còn ở trạng thái pending/confirmed)
// ─────────────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền hủy đơn hàng này" });
    }

    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Không thể hủy đơn hàng đang vận chuyển hoặc đã giao" });
    }

    order.orderStatus  = "cancelled";
    order.cancelReason = req.body.reason || "Người dùng hủy đơn";
    await order.save();

    // Hoàn trả stock nếu đã trừ (COD)
    if (order.paymentMethod === "cod") {
      await restoreStock(order.items);
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Helpers ──────────────────────────────────────────────────

const deductStock = async (items) => {
  await Promise.all(
    items.map(({ product, quantity }) =>
      Product.findByIdAndUpdate(product, {
        $inc: { stock: -quantity, sold: quantity },
      })
    )
  );
};

const restoreStock = async (items) => {
  await Promise.all(
    items.map(({ product, quantity }) =>
      Product.findByIdAndUpdate(product, {
        $inc: { stock: quantity, sold: -quantity },
      })
    )
  );
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
