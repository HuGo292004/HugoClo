import api from './axios';

/**
 * Lấy thông tin profile của user hiện tại
 * GET /api/user/profile
 */
export const getMyProfile = async () => {
  const res = await api.get('/user/profile');
  return res.data;
};

/**
 * Cập nhật profile user
 * PUT /api/user/profile
 */
export const updateMyProfile = async (data) => {
  const res = await api.put('/user/profile', data);
  return res.data;
};

/**
 * Đổi mật khẩu
 * PUT /api/user/change-password
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await api.put('/user/change-password', { currentPassword, newPassword });
  return res.data;
};

/**
 * Upload ảnh đại diện
 * POST /api/user/avatar
 */
export const uploadAvatar = async (formData) => {
  const res = await api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ── Admin APIs ─────────────────────────────────────────────────

/**
 * [Admin] Lấy danh sách tất cả người dùng
 * GET /api/user/admin/all
 */
export const fetchAllUsersAdmin = async (params = {}) => {
  const res = await api.get('/user/admin/all', { params });
  return res.data;
};

/**
 * [Admin] Cập nhật role người dùng
 * PUT /api/user/admin/:id/role
 */
export const updateUserRoleAdmin = async (id, role) => {
  const res = await api.put(`/user/admin/${id}/role`, { role });
  return res.data;
};

/**
 * [Admin] Khoá / mở khoá tài khoản
 * PATCH /api/user/admin/:id/status
 */
export const toggleUserStatusAdmin = async (id) => {
  const res = await api.patch(`/user/admin/${id}/status`);
  return res.data;
};

/**
 * [Admin] Xoá người dùng
 * DELETE /api/user/admin/:id
 */
export const deleteUserAdmin = async (id) => {
  const res = await api.delete(`/user/admin/${id}`);
  return res.data;
};

// ── Wishlist APIs ───────────────────────────────────────────────

/**
 * Lấy danh sách sản phẩm yêu thích
 * GET /api/user/wishlist
 */
export const getWishlist = async () => {
  const res = await api.get('/user/wishlist');
  return res.data; // { wishlist: [...] }
};

/**
 * Toggle sản phẩm yêu thích (thêm hoặc xóa)
 * POST /api/user/wishlist/toggle
 */
export const toggleWishlist = async (productId) => {
  const res = await api.post('/user/wishlist/toggle', { productId });
  return res.data; // { added: bool, wishlist: [...] }
};
