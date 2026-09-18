// ============================================================
// productService.js — API calls cho sản phẩm & reviews
// ============================================================

import api from "./axios";

/* ─── Products ──────────────────────────────────────────────── */

/**
 * Lấy danh sách sản phẩm có filter/sort/paginate
 * @param {Object} params - { page, limit, keyword, category, isOnSale, minPrice, maxPrice, minRating, size, sort }
 */
export const fetchProducts = (params = {}) =>
  api.get("/products", { params }).then((res) => res.data);

/**
 * Lấy chi tiết 1 sản phẩm theo ID (kèm ratingBreakdown)
 * @param {string} id - MongoDB ObjectId
 */
export const fetchProductById = (id) =>
  api.get(`/products/${id}`).then((res) => res.data);

/**
 * Tạo sản phẩm mới (admin)
 */
export const createProduct = (data) =>
  api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);

/**
 * Cập nhật sản phẩm (admin)
 */
export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);

/**
 * Xóa sản phẩm (admin)
 */
export const deleteProduct = (id) =>
  api.delete(`/products/${id}`).then((res) => res.data);

/* ─── Reviews ───────────────────────────────────────────────── */

/**
 * Lấy danh sách reviews của sản phẩm
 * @param {string} productId
 * @param {Object} params - { page, limit }
 */
export const fetchProductReviews = (productId, params = {}) =>
  api.get(`/products/${productId}/reviews`, { params }).then((res) => res.data);

/**
 * Tạo review (cần đăng nhập)
 * @param {string} productId
 * @param {{ rating: number, comment: string }} data
 */
export const createReview = (productId, data) =>
  api.post(`/products/${productId}/reviews`, data).then((res) => res.data);

/**
 * Bấm helpful cho review
 * @param {string} productId
 * @param {string} reviewId
 */
export const markHelpful = (productId, reviewId) =>
  api.put(`/products/${productId}/reviews/${reviewId}/helpful`).then((res) => res.data);

/**
 * Xóa review
 */
export const deleteReview = (productId, reviewId) =>
  api.delete(`/products/${productId}/reviews/${reviewId}`).then((res) => res.data);
