// ============================================================
// cartService.js — API calls cho giỏ hàng
// ============================================================

import api from "./axios";

/**
 * Lấy giỏ hàng của người dùng hiện tại
 */
export const getCartAPI = () =>
  api.get("/carts").then((res) => res.data);

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {{ productId: string, quantity: number }} payload
 */
export const addToCartAPI = ({ productId, quantity = 1 }) =>
  api.post("/carts/add", { productId, quantity }).then((res) => res.data);

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {{ productId: string, quantity: number }} payload
 */
export const updateCartAPI = ({ productId, quantity }) =>
  api.put("/carts/update", { productId, quantity }).then((res) => res.data);

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {string} productId
 */
export const removeFromCartAPI = (productId) =>
  api.delete(`/carts/remove/${productId}`).then((res) => res.data);
