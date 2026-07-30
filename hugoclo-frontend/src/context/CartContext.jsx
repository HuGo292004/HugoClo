import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from './AuthContext';
import { getCartAPI, addToCartAPI, updateCartAPI, removeFromCartAPI } from '../api/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(false);

  // Fetch giỏ hàng từ API khi người dùng đã đăng nhập
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getCartAPI();
      if (data && data.items) {
        setCartItems(data.items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      // Backend error fallback
      console.warn("Không thể tải giỏ hàng từ server:", err?.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product) return false;

      // ── Chưa đăng nhập: Lưu thông tin sản phẩm & điều hướng sang /auth ──
      if (!isLoggedIn) {
        try {
          const pendingItem = { product, quantity };
          localStorage.setItem('pending_cart_item', JSON.stringify(pendingItem));
          
          // Tránh lưu trang /auth làm trang điều hướng lại
          if (location.pathname !== '/auth') {
            localStorage.setItem('redirect_after_login', location.pathname + location.search);
          }
        } catch (e) {
          console.error("Lỗi khi lưu pending cart item:", e);
        }

        message.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        navigate('/auth');
        return false;
      }

      // ── Đã đăng nhập: Thêm trực tiếp vào giỏ hàng ──
      const productId = product._id || product.id;

      try {
        if (productId) {
          await addToCartAPI({ productId, quantity });
          await fetchCart();
        } else {
          // Fallback state nếu sản phẩm chưa có ID chuẩn
          setCartItems((prev) => {
            const existing = prev.find((item) => item.product?.id === product.id);
            if (existing) {
              return prev.map((item) =>
                item.product?.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
            }
            return [...prev, { product, quantity }];
          });
        }
        message.success(`Đã thêm "${product.name || 'sản phẩm'}" vào giỏ hàng!`);
        return true;
      } catch (err) {
        console.warn("Lỗi API addToCart, fallback local UI:", err?.message);
        setCartItems((prev) => [...prev, { product, quantity }]);
        message.success(`Đã thêm "${product.name || 'sản phẩm'}" vào giỏ hàng!`);
        return true;
      }
    },
    [isLoggedIn, location.pathname, location.search, navigate, fetchCart]
  );

  // ── Kiểm tra & Tự động thêm sản phẩm pending sau khi Đăng Nhập ──
  useEffect(() => {
    if (!isLoggedIn) return;

    const pendingRaw = localStorage.getItem('pending_cart_item');
    if (!pendingRaw) return;

    try {
      const pendingData = JSON.parse(pendingRaw);
      localStorage.removeItem('pending_cart_item');

      if (pendingData && pendingData.product) {
        const { product, quantity = 1 } = pendingData;
        const productId = product._id || product.id;

        const processAutoAdd = async () => {
          try {
            if (productId) {
              await addToCartAPI({ productId, quantity });
              await fetchCart();
            } else {
              setCartItems((prev) => [...prev, { product, quantity }]);
            }
            message.success(`Đã tự động thêm "${product.name}" vào giỏ hàng!`);
          } catch (err) {
            console.warn("Lỗi auto add to cart:", err);
            setCartItems((prev) => [...prev, { product, quantity }]);
            message.success(`Đã tự động thêm "${product.name}" vào giỏ hàng!`);
          }

          // Điều hướng quay lại trang người dùng xem dở trước khi login
          const redirectUrl = localStorage.getItem('redirect_after_login');
          if (redirectUrl) {
            localStorage.removeItem('redirect_after_login');
            navigate(redirectUrl);
          }
        };

        processAutoAdd();
      }
    } catch (err) {
      console.error("Lỗi khi xử lý giỏ hàng chờ sau login:", err);
      localStorage.removeItem('pending_cart_item');
    }
  }, [isLoggedIn, navigate, fetchCart]);

  // Tính tổng số lượng trong giỏ hàng
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
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
