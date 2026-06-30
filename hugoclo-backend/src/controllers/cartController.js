const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
  // Kiểm tra xem người dùng có phải là admin không
  try {
    // Lấy thông tin sản phẩm từ body của request
    const { productId, quantity } = req.body;
    // Tìm giỏ hàng của người dùng hiện tại
    let cart = await Cart.findOne({ user: req.user.id });
    // Nếu chưa có giỏ hàng, tạo mới
    if (!cart) {
      // Tạo giỏ hàng mới cho người dùng
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    //San phẩm đã có trong giỏ hàng
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      cart.items.push({ product: productId, quantity });
    }
    // Lưu giỏ hàng vào database
    await cart.save();
    // Trả về giỏ hàng đã được cập nhật
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy giỏ hàng của người dùng hiện tại
const getCart = async (req, res) => {
  // Kiểm tra xem người dùng có phải là admin không
  try {
    // Tìm giỏ hàng của người dùng hiện tại và populate thông tin sản phẩm
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
    );
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCart = async (req, res) => {
  try {
    // Lấy thông tin sản phẩm và số lượng mới từ body của request
    const { productId, quantity } = req.body;
    // Tìm giỏ hàng của người dùng hiện tại
    const cart = await Cart.findOne({ user: req.user.id });
    // Nếu không tìm thấy giỏ hàng, trả về lỗi
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }
    // Tìm sản phẩm trong giỏ hàng
    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    // Nếu không tìm thấy sản phẩm trong giỏ hàng, trả về lỗi
    if (!item) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }
    // Cập nhật số lượng sản phẩm
    item.quantity = quantity;
    // Lưu giỏ hàng vào database
    await cart.save();
    // Trả về giỏ hàng đã được cập nhật
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }); // Tìm giỏ hàng của người dùng hiện tại
    // Nếu không tìm thấy giỏ hàng, trả về lỗi
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }
    // Lọc ra các sản phẩm không phải là sản phẩm cần xóa
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId,
    );
    await cart.save(); // Lưu giỏ hàng vào database
    res.json(cart); // Trả về giỏ hàng đã được cập nhật
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getCart, updateCart, removeFromCart };
