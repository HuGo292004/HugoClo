// ============================================================
// reviewController.js — CRUD reviews cho product detail page
// ============================================================

const Review  = require("../models/Review");
const Product = require("../models/Product");

/* ── Lấy reviews của 1 sản phẩm (có paginate) ────────────── */
const getProductReviews = async (req, res) => {
  try {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(20, Number(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId })
        .populate("user", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: req.params.productId }),
    ]);

    // Format để khớp với frontend (name, avatar, date, verified, text, helpfulCount)
    const formatted = reviews.map((r) => ({
      _id:          r._id,
      name:         r.user?.fullName || "Ẩn danh",
      avatar:       (r.user?.fullName || "U").charAt(0).toUpperCase(),
      date:         new Date(r.createdAt).toLocaleDateString("vi-VN"),
      rating:       r.rating,
      verified:     r.verified,
      text:         r.comment,
      helpfulCount: r.helpfulCount,
      helpful:      r.helpfulCount,   // alias cho frontend
    }));

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      reviews: formatted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── Tạo review (cần đăng nhập) ──────────────────────────── */
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra đã review chưa
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }

    const review = await Review.create({
      product:  productId,
      user:     userId,
      rating,
      comment,
      verified: false, // TODO: check order history
    });

    res.status(201).json({ message: "Đánh giá thành công!", review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }
    res.status(500).json({ message: error.message });
  }
};

/* ── Bấm helpful ─────────────────────────────────────────── */
const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    // Kiểm tra đã bấm chưa
    const alreadyMarked = review.helpfulUsers.some(
      (id) => id.toString() === userId.toString()
    );
    if (alreadyMarked) {
      return res.status(400).json({ message: "Bạn đã đánh dấu hữu ích rồi" });
    }

    review.helpfulUsers.push(userId);
    review.helpfulCount += 1;
    await review.save();

    res.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── Xóa review (chủ review hoặc admin) ──────────────────── */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    // Chỉ chủ review hoặc admin mới được xóa
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền xóa review này" });
    }

    const productId = review.product;
    await review.deleteOne();

    // Cập nhật lại rating Product
    const stats = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    await Product.findByIdAndUpdate(productId, {
      rating:      stats.length ? Math.round(stats[0].avg * 10) / 10 : 0,
      reviewCount: stats.length ? stats[0].count : 0,
    });

    res.json({ message: "Đã xóa đánh giá" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProductReviews, createReview, markHelpful, deleteReview };
