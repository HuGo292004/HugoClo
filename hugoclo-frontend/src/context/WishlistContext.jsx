// ============================================================
// WishlistContext — Quản lý trạng thái wishlist toàn cục
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { getWishlist, toggleWishlist as toggleWishlistAPI } from "../api/userService";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      setWishlistIds(new Set());
      setWishlistProducts([]);
      return;
    }
    try {
      setLoading(true);
      const data = await getWishlist();
      const products = data.wishlist || [];
      setWishlistProducts(products);
      setWishlistIds(new Set(products.map((p) => p._id?.toString())));
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(
    async (product) => {
      if (!isLoggedIn) {
        message.warning("Vui lòng đăng nhập để lưu sản phẩm yêu thích!");
        return;
      }
      const productId = product._id?.toString();
      const wished = wishlistIds.has(productId);

      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wished) next.delete(productId);
        else next.add(productId);
        return next;
      });
      setWishlistProducts((prev) =>
        wished ? prev.filter((p) => p._id?.toString() !== productId) : [...prev, product]
      );

      try {
        await toggleWishlistAPI(productId);
        message.success(wished ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
      } catch {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wished) next.add(productId);
          else next.delete(productId);
          return next;
        });
        setWishlistProducts((prev) =>
          wished ? [...prev, product] : prev.filter((p) => p._id?.toString() !== productId)
        );
        message.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    },
    [isLoggedIn, wishlistIds]
  );

  const isWished = useCallback(
    (productId) => wishlistIds.has(productId?.toString()),
    [wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, wishlistProducts, loading, toggleWishlist, isWished, refetch: fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist phải được dùng bên trong WishlistProvider");
  return ctx;
};
