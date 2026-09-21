// ============================================================
// orderService.js — Gọi API quản lý đơn hàng
// ============================================================

import api from './axios';

/**
 * Tạo đơn hàng mới
 * @param {Object} orderData - { shippingAddress, paymentMethod, couponCode, discountAmt }
 * @returns {Promise<{ order, redirectUrl }>}
 */
export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

/**
 * Lấy danh sách đơn hàng của tôi
 * @param {{ page, limit }} params
 */
export const fetchMyOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  return data;
};

/**
 * Lấy chi tiết đơn hàng theo ID
 */
export const fetchOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

/**
 * Hủy đơn hàng
 * @param {string} id
 * @param {string} reason
 */
export const cancelOrder = async (id, reason = '') => {
  const { data } = await api.put(`/orders/${id}/cancel`, { reason });
  return data;
};

// ── Admin APIs ────────────────────────────────────────────────

/**
 * [ADMIN] Lấy tất cả đơn hàng với filter, search, phân trang
 * @param {{ page, limit, status, paymentMethod, search, from, to }} params
 */
export const fetchAllOrdersAdmin = async (params = {}) => {
  const { data } = await api.get('/orders/admin/all', { params });
  return data;
};

/**
 * [ADMIN] Cập nhật trạng thái đơn hàng
 * @param {string} id - Order ID
 * @param {string} status - New status: pending | confirmed | shipping | delivered | cancelled
 * @param {string} cancelReason - Lý do hủy (nếu status === 'cancelled')
 */
export const updateOrderStatusAdmin = async (id, status, cancelReason = '') => {
  const { data } = await api.put(`/orders/admin/${id}/status`, { status, cancelReason });
  return data;
};
