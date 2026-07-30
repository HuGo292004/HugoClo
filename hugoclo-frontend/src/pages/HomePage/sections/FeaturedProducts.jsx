// ============================================================
// FeaturedProducts — 4-column product grid (Tailwind CSS)
// ============================================================

import React, { useState } from 'react';
import { Rate, message } from 'antd';
import { HeartOutlined, HeartFilled, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { PRODUCTS, formatPrice } from '../../../data/products';
import { useCart } from '../../../context/CartContext';

/* ── Product Card ── */
const ProductCard = ({ product }) => {
  const [wishlisted,  setWishlisted]  = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart }                 = useCart();

  const handleCart = async () => {
    const success = await addToCart(product, 1);
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((p) => !p);
    message.info(wishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  return (
    <article
      className="bg-white rounded-lg overflow-hidden border border-[#f0f0f0] flex flex-col transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
      aria-label={product.name}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#f8f8f8] group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          loading="lazy"
        />

        {/* Sale badge */}
        {product.isOnSale && (
          <div className="absolute top-3 left-3 z-20 bg-[#e63946] text-white text-[10px] font-black tracking-[0.1em] px-2.5 py-1 rounded-[3px]">
            SALE
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/92 border-none flex items-center justify-center text-[16px] cursor-pointer transition-all duration-250 backdrop-blur-sm hover:bg-white hover:scale-110 ${
            wishlisted ? 'text-[#e63946]' : 'text-[#999]'
          }`}
          aria-label={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          {wishlisted ? <HeartFilled /> : <HeartOutlined />}
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <span className="bg-white/95 text-primary text-[13px] font-semibold px-5 py-2.5 rounded flex items-center gap-1.5 tracking-[0.04em] cursor-pointer hover:bg-white transition-colors">
            <EyeOutlined /> Xem nhanh
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-[14px] font-semibold text-primary leading-[1.4] line-clamp-2 m-0">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5">
          <Rate disabled defaultValue={product.rating} allowHalf style={{ fontSize: 13, color: '#d4af37' }} />
          <span className="text-[12px] text-[#999]">({product.reviewCount})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-[16px] font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-[13px] text-[#bbb] line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-1">
          <button className="h-[38px] flex items-center justify-center gap-1.5 text-[13px] font-semibold text-primary border border-[#d5d5d5] rounded bg-transparent cursor-pointer transition-all duration-200 hover:border-primary hover:bg-[#f8f8f8] w-full">
            <EyeOutlined /> Xem Chi Tiết
          </button>
          <button
            onClick={handleCart}
            className={`h-[38px] flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white rounded border-none cursor-pointer transition-all duration-200 w-full ${
              addedToCart ? 'bg-[#2d6a4f]' : 'bg-primary hover:bg-[#333]'
            }`}
          >
            <ShoppingCartOutlined /> {addedToCart ? 'Đã Thêm!' : 'Thêm Vào Giỏ'}
          </button>
        </div>
      </div>
    </article>
  );
};

/* ── Section ── */
const FeaturedProducts = () => {
  return (
    <section className="bg-white section-py" id="featured" aria-label="Sản phẩm nổi bật">
      <div className="container-custom">

        {/* Header */}
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-[32px] font-bold text-primary tracking-[-0.02em]">Sản Phẩm Nổi Bật</h2>
          <a
            href="#"
            className="text-[14px] font-semibold text-primary no-underline border-b border-transparent hover:border-primary transition-all duration-200 shrink-0 ml-6"
          >
            Xem Tất Cả →
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
