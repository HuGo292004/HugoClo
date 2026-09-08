import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from './AuthContext';
import { getCartAPI, addToCartAPI, updateCartAPI, removeFromCartAPI } from '../api/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(false);

  // ── Fetch giỏ hàng từ API ────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getCartAPI();
      setCartItems(data?.items || []);
    } catch (err) {
      console.warn('Không thể tải giỏ hàng:', err?.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Thêm sản phẩm vào giỏ hàng ──────────────────────────────
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product) return false;

      // Chưa đăng nhập → lưu pending & chuyển sang /auth
      if (!isLoggedIn) {
        try {
          localStorage.setItem('pending_cart_item', JSON.stringify({ product, quantity }));
          if (location.pathname !== '/auth') {
            localStorage.setItem('redirect_after_login', location.pathname + location.search);
          }
        } catch (e) {
          console.error('Lỗi lưu pending_cart_item:', e);
        }
        message.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        navigate('/auth');
        return false;
      }

      // Đã đăng nhập → gọi API, không dùng fallback giả
      const productId = product._id || product.id;
      if (!productId) {
        message.error('Không xác định được sản phẩm');
        return false;
      }

      try {
        await addToCartAPI({ productId, quantity });
        await fetchCart();  // sync lại từ server
        message.success(`Đã thêm "${product.name || 'sản phẩm'}" vào giỏ hàng!`);
        return true;
      } catch (err) {
        // Thông báo lỗi thực — không dùng fallback local state
        const errMsg = err?.response?.data?.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.';
        message.error(errMsg);
        return false;
      }
    },
    [isLoggedIn, location.pathname, location.search, navigate, fetchCart]
  );

  // ── Cập nhật số lượng ────────────────────────────────────────
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!productId || quantity < 1) return;
    try {
      await updateCartAPI({ productId, quantity });
      await fetchCart();
    } catch (err) {
      message.error('Không thể cập nhật số lượng');
      await fetchCart(); // revert về state server
    }
  }, [fetchCart]);

  // ── Xóa sản phẩm ────────────────────────────────────────────
  const removeFromCart = useCallback(async (productId) => {
    if (!productId) return;
    try {
      await removeFromCartAPI(productId);
      await fetchCart();
      message.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      message.error('Không thể xóa sản phẩm');
      await fetchCart();
    }
  }, [fetchCart]);

  // ── Tự động thêm sản phẩm pending sau khi đăng nhập ─────────
  useEffect(() => {
    if (!isLoggedIn) return;

    const pendingRaw = localStorage.getItem('pending_cart_item');
    if (!pendingRaw) return;

    localStorage.removeItem('pending_cart_item');

    try {
      const { product, quantity = 1 } = JSON.parse(pendingRaw);
      const productId = product?._id || product?.id;
      if (!productId || !product) return;

      const processAutoAdd = async () => {
        try {
          await addToCartAPI({ productId, quantity });
          await fetchCart();
          message.success(`Đã tự động thêm "${product.name}" vào giỏ hàng!`);
        } catch (err) {
          console.warn('Auto add to cart failed:', err);
          message.error('Không thể tự động thêm sản phẩm vào giỏ hàng');
        }

        const redirectUrl = localStorage.getItem('redirect_after_login');
        if (redirectUrl) {
          localStorage.removeItem('redirect_after_login');
          navigate(redirectUrl);
        }
      };

      processAutoAdd();
    } catch (err) {
      console.error('Lỗi xử lý pending cart:', err);
      localStorage.removeItem('pending_cart_item');
    }
  }, [isLoggedIn, navigate, fetchCart]);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được sử dụng bên trong CartProvider');
  return ctx;
};
