// ============================================================
// userRoutes.js — Routes quản lý profile user + Admin routes
// ============================================================

const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getProfile, updateProfile, changePassword, uploadAvatar,
  getAllUsers, updateUserRole, toggleUserStatus, deleteUser,
} = require('../controllers/userController');
const { upload } = require('../config/cloudinary.config');

// ── Middleware kiểm tra admin ──────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

// ── User profile routes ────────────────────────────────────────
// GET  /api/user/profile
router.get('/profile', protect, getProfile);

// PUT  /api/user/profile
router.put('/profile', protect, updateProfile);

// PUT  /api/user/change-password
router.put('/change-password', protect, changePassword);

// POST /api/user/avatar
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// ── Admin routes ───────────────────────────────────────────────
// GET  /api/user/admin/all
router.get('/admin/all', protect, adminOnly, getAllUsers);

// PUT  /api/user/admin/:id/role
router.put('/admin/:id/role', protect, adminOnly, updateUserRole);

// PATCH /api/user/admin/:id/status
router.patch('/admin/:id/status', protect, adminOnly, toggleUserStatus);

// DELETE /api/user/admin/:id
router.delete('/admin/:id', protect, adminOnly, deleteUser);

module.exports = router;
