// ============================================================
// FeaturedProducts — 6 sản phẩm ngẫu nhiên từ DB
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rate } from 'antd';
import { HeartOutlined, HeartFilled, ShoppingCartOutlined } from '@ant-design/icons';
import { formatPrice } from '../../../data/products';
import { fetchProducts } from '../../../api/productService';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-lg overflow-hidden border border-[#f0f0f0] animate-pulse">
    <div className="aspect-square bg-[#f0f0f0]" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-4 bg-[#f0f0f0] rounded w-3/4" />
      <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
      <div className="h-4 bg-[#f0f0f0] rounded w-1/3" />
      <div className="flex gap-2 mt-1">
        <div className="flex-1 h-9 bg-[#f0f0f0] rounded" />
        <div className="flex-1 h-9 bg-[#f0f0f0] rounded" />
      </div>
    </div>
  </div>
);

/* ── Product Card ── */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWished } = useWishlist();
  const wished = isWished(product._id);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <article
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-white rounded-lg overflow-hidden border border-[#f0f0f0] flex flex-col transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 cursor-pointer"
      aria-label={product.name}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#f8f8f8] group">
        <img
          src={product.images?.[0] || ''}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          loading="lazy"
        />

        {/* Badge */}
        {product.isOnSale ? (
          <div className="absolute top-3 left-3 z-20 bg-[#e63946] text-white text-[10px] font-black tracking-[0.1em] px-2.5 py-1 rounded-[3px]">
            -{discount}% SALE
          </div>
        ) : (
          <div className="absolute top-3 left-3 z-20 bg-[#1a1a1a] text-white text-[10px] font-black tracking-[0.1em] px-2.5 py-1 rounded-[3px]">
            NEW
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist({ ...product, id: product._id, image: product.images?.[0] }); }}
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/92 border-none flex items-center justify-center text-[16px] cursor-pointer transition-all duration-250 backdrop-blur-sm hover:bg-white hover:scale-110 ${
            wished ? 'text-[#e63946]' : 'text-[#999]'
          }`}
          aria-label={wished ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          {wished ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-[14px] font-semibold text-primary leading-[1.4] line-clamp-2 m-0">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5">
          <Rate disabled value={product.rating || 0} allowHalf style={{ fontSize: 13, color: '#d4af37' }} />
          <span className="text-[12px] text-[#999]">({product.reviewCount || 0})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-[16px] font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-[13px] text-[#bbb] line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <Link
            to={`/products/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 h-[38px] flex items-center justify-center text-[12px] font-semibold text-primary border border-[#d5d5d5] rounded bg-transparent cursor-pointer transition-all duration-200 hover:border-primary hover:bg-[#f8f8f8] no-underline"
          >
            Xem Chi Tiết
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); addToCart({ ...product, id: product._id, image: product.images?.[0] }, 1); }}
            className="flex-1 h-[38px] flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white bg-primary rounded border-none cursor-pointer transition-all duration-200 hover:bg-[#333]"
          >
            <ShoppingCartOutlined /> Thêm Vào Giỏ
          </button>
        </div>
      </div>
    </article>
  );
};

/* ── Section ── */
const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    // Lấy ngẫu nhiên: sort=random, limit=6
    fetchProducts({ limit: 6, sort: 'random' })
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white section-py" id="featured" aria-label="Sản phẩm nổi bật">
      <div className="container-custom">

        {/* Header */}
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-[32px] font-bold text-primary tracking-[-0.02em]">Sản Phẩm Nổi Bật</h2>
          <Link
            to="/products"
            className="text-[14px] font-semibold text-primary no-underline border-b border-transparent hover:border-primary transition-all duration-200 shrink-0 ml-6"
          >
            Xem Tất Cả →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
          }
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
