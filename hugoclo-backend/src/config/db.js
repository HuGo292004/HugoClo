const mongoose = require("mongoose");

// Kết nối đến MongoDB bằng Mongoose.
// Hàm này được gọi khi app khởi động để mở kết nối tới cơ sở dữ liệu.
const connectDB = async () => {
  try {
    // Dùng biến môi trường MONGO_URI để lấy chuỗi kết nối.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    // Nếu kết nối thất bại, in ra thông báo lỗi và dừng server.
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
