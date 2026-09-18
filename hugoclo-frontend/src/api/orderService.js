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
