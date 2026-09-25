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
