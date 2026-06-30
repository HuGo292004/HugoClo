const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // Lấy token từ header Authorization (định dạng: "Bearer <token>")
    const authHeader = req.headers.authorization;
    // Nếu không có header hoặc không đúng định dạng, trả về lỗi.
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Không có token, truy cập bị từ chối" });
    }
    // Tách token từ header.
    const token = authHeader.split(" ")[1];
    // Xác minh token bằng JWT_SECRET.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Lưu thông tin người dùng đã giải mã vào req.user để các middleware tiếp theo có thể sử dụng.
    req.user = decoded;
    // Chuyển sang middleware tiếp theo.
    next();
  } catch (error) {
    // Nếu token không hợp lệ hoặc đã hết hạn, trả về lỗi.
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = protect;
