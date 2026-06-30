const express = require("express");

const router = express.Router();

// Đăng ký, đăng nhập người dùng mới
const { register, login } = require("../controllers/authController");
router.post("/register", register);
router.post("/login", login);

module.exports = router;
