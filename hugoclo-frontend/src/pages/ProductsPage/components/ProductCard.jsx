// ============================================================
// ProductCard — Square image, badges, hover overlay, quick-add
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartOutlined, HeartFilled, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { formatPrice } from '../../../data/products';
import { useCart } from '../../../context/CartContext';

const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-[#f59e0b]' : 'text-[#e5e5e5]'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="text-[12px] text-[#888]">({count})</span>
  </div>
);

const ProductCard = ({ product }) => {
  const [wished, setWished]   = useState(false);
  const [hovered, setHovered] = useState(false);
  const { addToCart }        = useCart();
  const navigate = useNavigate();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  const handleWish = (e) => {
    e.stopPropagation();
    setWished((w) => !w);
    message.success(wished ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích ❤️');
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group bg-white rounded-xl overflow-hidden border border-[#f0f0f0] hover:border-[#d0d0d0] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] cursor-pointer flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image wrapper ── */}
      <div className="relative aspect-square overflow-hidden bg-[#f8f8f8]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
        />

        {/* Badge top-left */}
        {product.isOnSale ? (
          <span className="absolute top-3 left-3 bg-[#e63946] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wider z-10">
            -{discount}% SALE
          </span>
        ) : (
          <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wider z-10">
            NEW
          </span>
        )}

        {/* Wishlist top-right */}
        <button
          onClick={handleWish}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[16px] border-none cursor-pointer transition-all duration-200 hover:scale-110 z-10 shadow-sm"
          aria-label="Thêm vào yêu thích"
        >
          {wished
            ? <HeartFilled className="text-[#e63946]" />
            : <HeartOutlined className="text-[#666]" />
          }
        </button>

        {/* Hover overlay — Quick Add */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-[#1a1a1a]/90 backdrop-blur-sm flex items-center justify-center gap-3 py-3.5 transition-all duration-300 ${
            hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {/* <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 text-white text-[12px] font-semibold tracking-[0.06em] bg-transparent border-none cursor-pointer hover:text-[#f0f0f0] uppercase"
          >
            <ShoppingCartOutlined />
            Thêm Nhanh
          </button>
          <div className="w-px h-4 bg-white/30" />
          <button className="flex items-center gap-1.5 text-white text-[12px] font-semibold tracking-[0.06em] bg-transparent border-none cursor-pointer hover:text-[#f0f0f0] uppercase">
            <EyeOutlined />
            Xem Nhanh
          </button> */}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category label */}
        <span className="text-[10px] font-semibold text-[#aaa] uppercase tracking-[0.12em]">
          {product.category === 'men' ? 'Nam' : product.category === 'women' ? 'Nữ' : 'Unisex'}
        </span>

        {/* Product name — 2 lines max */}
        <h3 className="text-[14px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2 m-0 font-['Inter']">
          {product.name}
        </h3>

        {/* Rating */}
        <StarRating rating={product.rating} count={product.reviewCount} />

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-[15px] font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-[13px] text-[#bbb] line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-1">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 h-9 text-[12px] font-semibold border border-[#1a1a1a] text-[#1a1a1a] rounded-lg bg-transparent cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] hover:text-white tracking-[0.04em] flex items-center justify-center no-underline"
          >
            Xem Chi Tiết
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex-1 h-9 text-[12px] font-semibold bg-[#1a1a1a] text-white rounded-lg border-none cursor-pointer transition-all duration-200 hover:bg-[#333] tracking-[0.04em]"
          >
            Thêm Vào Giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
