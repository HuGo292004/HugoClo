// ============================================================
// Product Model — khớp với ProductDetailPage & ProductCard frontend
// ============================================================

const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true },          // e.g. "Đen"
    code:   { type: String, required: true },          // e.g. "#1a1a1a"
    images: { type: [String], default: [] },           // Ảnh riêng của màu này
  },
  { _id: false }
);

const sizeSchema = new mongoose.Schema(
  {
    label:     { type: String, required: true, enum: ["S", "M", "L", "XL", "XXL"] },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // ── Cơ bản ────────────────────────────────────────
    name: {
      type:     String,
      required: true,
      trim:     true,
    },

    description: {
      type:    String,
      default: "",
    },

    material: {
      type:    String,     // "Cotton 100% cao cấp, trọng lượng 220gsm..."
      default: "",
    },

    sizeGuide: {
      type:    String,     // Bảng size dạng text thuần
      default: "",
    },

    // ── Giá ───────────────────────────────────────────
    price: {
      type:     Number,
      required: true,
    },

    originalPrice: {
      type:    Number,
      default: null,       // null = không giảm giá
    },

    isOnSale: {
      type:    Boolean,
      default: false,
    },

    // Giới tính: dùng cho filter "Nam | Nữ" trên nav
    gender: {
      type:    String,
      enum:    ["men", "women", "unisex"],
      default: "unisex",
    },

    // Loại sản phẩm: dùng cho filter "Ao | Quần | Phụ Kiện" trên quick-filter bar
    productType: {
      type:    String,
      enum:    ["tops", "bottoms", "shoes", "accessory"],
      default: "tops",
    },

    // ── Media ─────────────────────────────────────────
    images: {
      type:    [String],   // Mảng URL ảnh; ảnh đầu tiên là ảnh chính
      default: [],
    },

    // ── Biến thể ──────────────────────────────────────
    colors: {
      type:    [colorSchema],  // [{name: "Đen", code: "#1a1a1a"}, ...]
      default: [],
    },

    sizes: {
      type:    [sizeSchema],   // [{label: "M", available: true}, ...]
      default: [],
    },

    // ── Danh mục ──────────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Category",
    },

    // ── Kho & thống kê ────────────────────────────────
    stock: {
      type:    Number,
      default: 0,
    },

    sold: {
      type:    Number,
      default: 0,
    },

    // ── Đánh giá tổng hợp (tính lại khi có review mới) ─
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },

    reviewCount: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index để tìm kiếm nhanh ──────────────────────────────────
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, isOnSale: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);
