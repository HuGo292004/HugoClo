// ============================================================
// WishlistPage — Trang danh sách sản phẩm yêu thích
// ============================================================

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartFilled, HeartOutlined, ShoppingCartOutlined, DeleteOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Empty, Spin } from "antd";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const formatPrice = (n) =>
  n?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ?? "";

const WishlistPage = () => {
  const { wishlistProducts, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-[#fff0f1] flex items-center justify-center text-[48px]">
          <HeartFilled style={{ color: "#e63946" }} />
        </div>
        <div className="text-center">
          <h2 className="text-[22px] font-bold text-[#1a1a1a] m-0 mb-2">Danh sách yêu thích</h2>
          <p className="text-[#888] text-[15px] m-0">Vui lòng đăng nhập để xem danh sách yêu thích của bạn.</p>
        </div>
        <Link
          to="/auth"
          className="h-11 px-8 bg-[#1a1a1a] text-white text-[14px] font-semibold rounded-full no-underline flex items-center gap-2 hover:bg-[#333] transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#1a1a1a] m-0 tracking-tight ">
            Yêu Thích
          </h1>
          {/* {!loading && (
            <p className="text-[14px] text-[#888] m-0 mt-1">
              {wishlistProducts.length > 0
                ? `${wishlistProducts.length} sản phẩm đang được lưu`
                : "Chưa có sản phẩm nào"}
            </p>
          )} */}
        </div>
        {wishlistProducts.length > 0 && (
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1a1a1a] no-underline hover:text-[#555] transition-colors"
          >
            Tiếp tục mua sắm <ArrowRightOutlined />
          </Link>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spin size="large" />
        </div>
      ) : wishlistProducts.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-[#fafafa] border-2 border-dashed border-[#e5e5e5] flex items-center justify-center">
              <HeartOutlined style={{ fontSize: 48, color: "#ddd" }} />
            </div>
          </div>
          <div className="text-center max-w-[360px]">
            <h3 className="text-[18px] font-bold text-[#1a1a1a] m-0 mb-2">
              Chưa có sản phẩm yêu thích
            </h3>
            {/* <p className="text-[14px] text-[#999] m-0 leading-relaxed">
              Khám phá các sản phẩm và nhấn biểu tượng ❤️ để lưu vào đây nhé!
            </p> */}
          </div>
          <Link
            to="/products"
            className="h-11 px-8 bg-[#1a1a1a] text-white text-[14px] font-semibold rounded-full no-underline flex items-center gap-2 hover:bg-[#333] transition-colors"
          >
            <ShoppingCartOutlined />
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        /* Product grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistProducts.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={() => toggleWishlist(product)}
              onAddToCart={() => addToCart(product, 1)}
              onNavigate={() => navigate(`/products/${product._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Wishlist Product Card ── */
const WishlistCard = ({ product, onRemove, onAddToCart, onNavigate }) => {
  const [hovered, setHovered] = React.useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden border border-[#f0f0f0] hover:border-[#d0d0d0] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] cursor-pointer flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden bg-[#f8f8f8]"
        onClick={onNavigate}
      >
        <img
          src={product.images?.[0] || ""}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
        />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#e63946] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wider z-10">
            -{discount}% SALE
          </span>
        )}

        {/* Remove from wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[16px] border-none cursor-pointer transition-all duration-200 hover:scale-110 z-10 shadow-sm"
          title="Xóa khỏi yêu thích"
        >
          <HeartFilled className="text-[#e63946]" />
        </button>

        {/* Hover overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-[#1a1a1a]/90 backdrop-blur-sm flex items-center justify-center py-3 transition-all duration-300 ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className="flex items-center gap-1.5 text-white text-[12px] font-semibold tracking-[0.06em] bg-transparent border-none cursor-pointer hover:text-[#f0f0f0] uppercase"
          >
            <ShoppingCartOutlined />
            Thêm Vào Giỏ
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[10px] font-semibold text-[#aaa] uppercase tracking-[0.12em]">
          {product.gender === "men" ? "Nam" : product.gender === "women" ? "Nữ" : "Unisex"}
        </span>
        <h3
          className="text-[14px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2 m-0 cursor-pointer hover:text-[#555] transition-colors"
          onClick={onNavigate}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-[15px] font-bold text-[#1a1a1a]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[13px] text-[#bbb] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={onNavigate}
            className="flex-1 h-9 text-[12px] font-semibold border border-[#1a1a1a] text-[#1a1a1a] rounded-lg bg-transparent cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] hover:text-white tracking-[0.04em]"
          >
            Xem Chi Tiết
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className="flex-1 h-9 text-[12px] font-semibold bg-[#1a1a1a] text-white rounded-lg border-none cursor-pointer transition-all duration-200 hover:bg-[#333] tracking-[0.04em]"
          >
            Thêm Vào Giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
