// ============================================================
// Category Model — mở rộng thêm label, slug, gender để khớp frontend
// ============================================================

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // ── Thông tin hiển thị ────────────────────────────
    name: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },

    // Slug dùng cho URL, e.g. "ao-oversize"
    slug: {
      type:   String,
      unique: true,
    },

    // Label phân giới tính — dùng cho nav "Nam | Nữ | Unisex"
    gender: {
      type: String,
      enum: ["men", "women", "unisex"],
    },

    // Ảnh đại diện danh mục (dùng trong CategorySection homepage)
    image: {
      type:    String,
      default: "",
    },

    // Badge sale (CategorySection dùng isSale)
    isSale: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Tự động sinh slug từ name trước khi save
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
