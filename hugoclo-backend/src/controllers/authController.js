const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
  try {
    // Lấy thông tin từ body của request.
    const { fullName, email, password, phone, avatar } = req.body;
    // Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    // Nếu đã tồn tại, trả về lỗi.
    if (userExists) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    // Hash mật khẩu trước khi lưu vào database.
    // bcryptjs dùng callback; bọc trong Promise để có thể dùng `await`.
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });
    // Tạo người dùng mới với thông tin đã được hash mật khẩu.
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      avatar,
    });
    // Trả về thông tin người dùng đã được tạo (không bao gồm mật khẩu).
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    // Lấy thông tin từ body của request.
    const { email, password } = req.body;
    // Tìm người dùng theo email.
    const user = await User.findOne({ email });
    // Nếu không tìm thấy người dùng, trả về lỗi.
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // So sánh mật khẩu đã nhập với mật khẩu đã hash trong database.
    const isMatch = await bcrypt.compare(password, user.password);
    // Nếu mật khẩu không khớp, trả về lỗi.
    if (!isMatch) {
      return res.status(400).json({
        message: "Sai mật khẩu",
      });
    }
    // Tạo token JWT với thông tin người dùng (id và role).
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};
