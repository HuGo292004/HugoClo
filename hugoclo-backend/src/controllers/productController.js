// ============================================================
// productController.js — CRUD + filter/sort/paginate + reviews
// ============================================================

const Product  = require("../models/Product");
const Review   = require("../models/Review");


/* ── Tạo sản phẩm (kèm upload ảnh Cloudinary) ────────────── */
const createProduct = async (req, res) => {
  try {
    // Lấy link ảnh từ Cloudinary (sau khi multer upload xong)
    // req.files có dự liệu khi dùng upload.array()
    const imageUrls = req.files?.map((file) => file.path) || [];

    // Parse các field JSON gửi từ form-data
    const colors    = req.body.colors    ? JSON.parse(req.body.colors)    : [];
    const sizes     = req.body.sizes     ? JSON.parse(req.body.sizes)     : [];

    const product = await Product.create({
      ...req.body,          // name, price, description, category, isOnSale, material, sizeGuide...
      images: imageUrls,    // mảng URL Cloudinary
      colors,
      sizes,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── Lấy danh sách sản phẩm (có filter + sort + paginate) ─── */
const getProducts = async (req, res) => {
  try {
    const page    = Math.max(1, Number(req.query.page)  || 1);
    const limit   = Math.min(48, Number(req.query.limit) || 12);
    const skip    = (page - 1) * limit;

    // ── Build filter ──────────────────────────────────────────
    const filter = {};

    // Tìm kiếm theo tên
    if (req.query.keyword) {
      filter.name = { $regex: req.query.keyword, $options: "i" };
    }

    // ── Lọc gender ────────────────────────────────────────────
    // ?category=men  (quick filter — single)
    // ?gender=men    (legacy)
    // ?genders=men,women,unisex  (sidebar — multi)
    const GENDERS = ["men", "women", "unisex"];

    if (req.query.genders) {
      const gList = req.query.genders.split(",").filter((g) => GENDERS.includes(g));
      if (gList.length === 1) filter.gender = gList[0];
      else if (gList.length > 1) filter.gender = { $in: gList };
    } else if (req.query.category && GENDERS.includes(req.query.category)) {
      filter.gender = req.query.category;
    } else if (req.query.gender && GENDERS.includes(req.query.gender)) {
      filter.gender = req.query.gender;
    } else if (req.query.category) {
      // ObjectId
      filter.category = req.query.category;
    }

    // ── Lọc sale ──────────────────────────────────────────────
    if (req.query.isOnSale === "true") {
      filter.isOnSale = true;
    }

    // ── Lọc giá ───────────────────────────────────────────────
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // ── Lọc rating tối thiểu ──────────────────────────────────
    if (req.query.minRating) {
      filter.rating = { $gte: Number(req.query.minRating) };
    }

    // ── Lọc size (multi) ──────────────────────────────────────
    if (req.query.sizes) {
      const sizeList = req.query.sizes.split(",");
      filter.sizes = {
        $elemMatch: { label: { $in: sizeList }, available: true },
      };
    } else if (req.query.size) {
      filter.sizes = {
        $elemMatch: { label: req.query.size, available: true },
      };
    }

    // ── Lọc màu sắc theo hex code (multi) ─────────────────────
    if (req.query.colors) {
      const hexList = req.query.colors.split(",");
      filter["colors.code"] = { $in: hexList };
    }

    // ── Lọc loại sản phẩm ─────────────────────────────────────
    if (req.query.productType) {
      filter.productType = req.query.productType;
    }

    // ── Build sort ────────────────────────────────────────────
    const sortMap = {
      price_asc:   { price: 1 },
      price_desc:  { price: -1 },
      rating:      { rating: -1 },
      best_seller: { sold: -1 },
      newest:      { createdAt: -1 },
    };
    const sort = sortMap[req.query.sort] || { createdAt: -1 };

    // ── Query ─────────────────────────────────────────────────
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug gender")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      page,
      limit,
      totalPages:    Math.ceil(total / limit),
      totalProducts: total,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── Lấy sản phẩm theo ID (kèm reviews) ─────────────────────── */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug gender")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kèm theo rating breakdown (phân bố sao)
    const ratingBreakdown = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const breakdown = [5, 4, 3, 2, 1].map((star) => {
      const found = ratingBreakdown.find((r) => r._id === star);
      const count = found ? found.count : 0;
      return {
        star,
        count,
        percent: product.reviewCount
          ? Math.round((count / product.reviewCount) * 100)
          : 0,
      };
    });

    res.json({ ...product, ratingBreakdown: breakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── Cập nhật sản phẩm (có thể upload ảnh mới) ──────────── */
const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Nếu có file mới upload → gộp vào danh sách ảnh cũ
    const newImageUrls = req.files?.map((file) => file.path) || [];
    const mergedImages = [...(existing.images || []), ...newImageUrls];

    // Parse JSON fields nếu gửi từ form-data
    const colors = req.body.colors ? JSON.parse(req.body.colors) : undefined;
    const sizes  = req.body.sizes  ? JSON.parse(req.body.sizes)  : undefined;

    const updateData = {
      ...req.body,
      images: mergedImages,
      ...(colors !== undefined && { colors }),
      ...(sizes  !== undefined && { sizes  }),
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── Xóa sản phẩm ─────────────────────────────────────────── */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    // Xóa reviews liên quan
    await Review.deleteMany({ product: req.params.id });
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
