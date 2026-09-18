const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config(); // Đảm bảo đã load file .env

// 1. Cấu hình thông tin đăng nhập Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Cấu hình nơi lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hugoclo_products', // Tên thư mục sẽ tạo trên Cloudinary để chứa ảnh
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'], // Các định dạng cho phép
  },
});

// 3. Khởi tạo Multer
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };