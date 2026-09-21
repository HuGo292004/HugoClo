// ============================================================
// adminMiddleware — Kiểm tra quyền admin
// Dùng sau protect middleware (req.user đã được gán)
// ============================================================

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Chỉ Admin mới có quyền thực hiện thao tác này' });
};

module.exports = adminOnly;
