// ============================================================
// Review Model — khớp với phần reviews trong ProductDetailPage
// ============================================================

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // ── Liên kết ──────────────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },

    // ── Nội dung đánh giá ─────────────────────────────
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5,
    },

    comment: {
      type:    String,
      default: "",
    },

    // ── Hữu ích (helpful button trên frontend) ────────
    helpfulCount: {
      type:    Number,
      default: 0,
    },

    // Lưu danh sách userId đã bấm helpful (tránh spam)
    helpfulUsers: {
      type:    [mongoose.Schema.Types.ObjectId],
      default: [],
    },

    // ── Đã xác nhận mua hàng ─────────────────────────
    verified: {
      type:    Boolean,
      default: false,    // true nếu user có đơn hàng đã giao thành công với sản phẩm này
    },
  },
  {
    timestamps: true,
  }
);

// ── Sau khi lưu review, tự động cập nhật rating & reviewCount Product ──
reviewSchema.post("save", async function () {
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { product: this.product } },
    {
      $group: {
        _id:         "$product",
        avgRating:   { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(this.product, {
      rating:      Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].totalReviews,
    });
  }
});

// ── Mỗi user chỉ review 1 lần / sản phẩm ─────────────────────
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);