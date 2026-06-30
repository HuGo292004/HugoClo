const Category = require("../models/Category");
// Tạo danh mục mới
const createCategory = async (req, res) => {
  // Kiểm tra xem người dùng có phải là admin không
  try {
    // Lấy tên danh mục từ body của request
    const category = await Category.create(req.body);
    // Trả về danh mục đã được tạo
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả danh mục
const getCategories = async (req, res) => {
  // Lấy tất cả danh mục từ database
  try {
    const categories = await Category.find();
    // Trả về danh sách danh mục
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
};
