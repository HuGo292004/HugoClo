const express = require("express");
const router  = express.Router();
const { upload } = require("../config/cloudinary.config"); // Cloudinary middleware

const {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Lấy tất cả sản phẩm (có filter/sort/paginate)
router.get("/", getProducts);

// Lấy sản phẩm theo ID
router.get("/:id", getProductById);

// Tạo sản phẩm mới — upload tối đa 5 ảnh, field name = "images"
router.post("/", upload.array("images", 5), createProduct);

// Cập nhật sản phẩm — có thể gửi thêm ảnh mới
router.put("/:id", upload.array("images", 5), updateProduct);

// Xóa sản phẩm theo ID
router.delete("/:id", deleteProduct);

module.exports = router;
