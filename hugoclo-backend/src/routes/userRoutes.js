// ============================================================
// userRoutes.js — Routes quản lý profile user
// ============================================================

const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword, uploadAvatar } = require('../controllers/userController');
const { upload } = require('../config/cloudinary.config');

// GET  /api/user/profile
router.get('/profile', protect, getProfile);

// PUT  /api/user/profile
router.put('/profile', protect, updateProfile);

// PUT  /api/user/change-password
router.put('/change-password', protect, changePassword);

// POST /api/user/avatar
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
