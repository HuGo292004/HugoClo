// ============================================================
// ProductDetailPage — Full product detail kết nối API thực
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { message, Collapse, Spin, Rate } from 'antd';
import {
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
  HeartFilled,
  SwapOutlined,
  TruckOutlined,
  SafetyOutlined,
  RetweetOutlined,
  ZoomInOutlined,
  StarFilled,
  CheckCircleFilled,
  LikeOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons';

import { fetchProductById, fetchProductReviews, fetchProducts, markHelpful as apiMarkHelpful } from '../../api/productService';
import { formatPrice } from '../../data/products';
import ProductCard from '../ProductsPage/components/ProductCard';
import { useCart } from '../../context/CartContext';

/* ── Star renderer ─────────────────────────────────── */
const Stars = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <StarFilled
        key={s}
        style={{ fontSize: size, color: s <= Math.round(rating) ? '#d4af37' : '#e5e5e5' }}
      />
    ))}
  </div>
);

/* ── Image placeholder khi không có ảnh ────────────── */
const PlaceholderImg = () => (
  <div className="w-full h-full bg-[#f0f0f0] flex items-center justify-center">
    <span className="text-[#ccc] text-[48px]">🖼</span>
  </div>
);

/* ── Skeleton loading ───────────────────────────────── */
const DetailSkeleton = () => (
  <div className="container-custom py-10 animate-pulse">
    <div className="flex gap-12">
      <div className="w-[55%] shrink-0 aspect-square bg-[#f0f0f0] rounded-2xl" />
      <div className="flex-1 flex flex-col gap-4 py-2">
        <div className="h-3 bg-[#f0f0f0] rounded w-1/4" />
        <div className="h-8 bg-[#f0f0f0] rounded w-3/4" />
        <div className="h-4 bg-[#f0f0f0] rounded w-1/2" />
        <div className="h-20 bg-[#f0f0f0] rounded" />
        <div className="h-10 bg-[#f0f0f0] rounded" />
        <div className="h-12 bg-[#f0f0f0] rounded" />
        <div className="h-12 bg-[#f0f0f0] rounded" />
      </div>
    </div>
  </div>
);

/* ── Normalize product từ API ───────────────────────── */
const normalizeForCard = (p) => ({
  ...p,
  id:            p._id,
  image:         p.images?.[0] || '',
  reviewCount:   p.reviewCount || 0,
  originalPrice: p.originalPrice || null,
});

/* ── Main Page ─────────────────────────────────────── */
const ProductDetailPage = () => {
  const { id } = useParams();

  // Product state
  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Reviews state
  const [reviews,       setReviews]      = useState([]);
  const [ratingBreakdown, setBreakdown]  = useState([]);
  const [reviewsLoading, setRevLoading]  = useState(true);

  // UI state
  const [activeImg,      setActiveImg]   = useState(0);
  const [selectedColor,  setColor]       = useState(0);
  const [selectedSize,   setSize]        = useState(0);
  const [quantity,       setQty]         = useState(1);
  const [wished,         setWished]      = useState(false);
  const [zoom,           setZoom]        = useState(false);
  const [helpfulIds,     setHelpful]     = useState([]);
  const [activeAccordion, setAccordion]  = useState(['desc']);

  // Related products (first 4 từ API, khác productId hiện tại)
  const [related, setRelated] = useState([]);

  // ── Fetch product ──────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setActiveImg(0);
    setColor(0);
    setSize(0);

    fetchProductById(id)
      .then((data) => {
        setProduct(data);
        setBreakdown(data.ratingBreakdown || []);
      })
      .catch((err) => setError(err.message || 'Không thể tải sản phẩm'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Fetch reviews ──────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setRevLoading(true);
    fetchProductReviews(id, { limit: 10 })
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setRevLoading(false));
  }, [id]);

  // ── Fetch related (same category, limit 4) ─────────
  useEffect(() => {
    if (!product) return;
    fetchProducts({
      category: product.category?._id || product.category,
      limit:    5,
    }).then((data) => {
      const others = (data.products || [])
        .filter((p) => p._id !== id)
        .slice(0, 4)
        .map(normalizeForCard);
      setRelated(others);
    }).catch(() => setRelated([]));
  }, [product, id]);

  const { addToCart } = useCart();

  // ── Handlers ───────────────────────────────────────
  const handleCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    message.info('Chuyển đến trang thanh toán...');
  };

  const handleHelpful = async (reviewId, productId) => {
    if (helpfulIds.includes(reviewId)) return;
    try {
      await apiMarkHelpful(productId, reviewId);
      setHelpful((prev) => [...prev, reviewId]);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
        )
      );
      message.success('Cảm ơn phản hồi của bạn!');
    } catch {
      // Nếu chưa login, vẫn update UI tạm thời
      setHelpful((prev) => [...prev, reviewId]);
      message.info('Vui lòng đăng nhập để đánh dấu hữu ích');
    }
  };

  const prevImg = () =>
    setActiveImg((i) => (i - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
  const nextImg = () =>
    setActiveImg((i) => (i + 1) % (product?.images?.length || 1));

  // ── Loading ────────────────────────────────────────
  if (loading) return <DetailSkeleton />;

  // ── Error ──────────────────────────────────────────
  if (error) return (
    <div className="container-custom py-24 text-center">
      <WarningOutlined style={{ fontSize: '48px'}} />
      <h2 className="text-[24px] font-bold mt-4 mb-2">Không thể tải sản phẩm</h2>
      <p className="text-[#888] mb-6">{error}</p>
      <Link to="/products" className="inline-block h-10 px-6 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-lg leading-10 no-underline hover:bg-[#333]">
        Quay lại danh sách
      </Link>
    </div>
  );

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const allImages  = product.images?.length ? product.images : [null];
  const colors     = product.colors || [];
  const sizes      = product.sizes  || [];
  const categoryLabel = product.category?.name || '';

  // ── Ảnh hiển thị: ưu tiên ảnh của màu đang chọn ──
  const colorImages = colors[selectedColor]?.images;
  const images = colorImages?.length ? colorImages : allImages;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[#ebebeb]">
        <div className="container-custom py-3.5">
          <nav className="flex items-center gap-2 text-[14px] text-[#999] flex-wrap" aria-label="breadcrumb">
            <Link to="/" className="flex items-center gap-1.5 hover:text-[#1a1a1a] transition-colors no-underline text-[#999] font-medium">
              <HomeOutlined /> <span>Trang Chủ</span>
            </Link>
            <span className="text-[#ccc]">/</span>
            <Link to="/products" className="hover:text-[#1a1a1a] transition-colors text-[#999] font-medium">Sản Phẩm</Link>
            {categoryLabel && (
              <>
                <span className="text-[#ccc]">/</span>
                <span className="text-[#999] font-medium">{categoryLabel}</span>
              </>
            )}
            <span className="text-[#ccc]">/</span>
            <span className="font-semibold text-[#1a1a1a]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Product Detail 2-col ── */}
      <div className="container-custom py-10">
        <div className="flex gap-12 items-start">

          {/* ── LEFT: Image Gallery (55%) ── */}
          <div className="w-[55%] shrink-0">
            <div
              className={`relative aspect-square bg-[#f8f8f8] rounded-2xl overflow-hidden group border border-[#f0f0f0] ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={() => setZoom(!zoom)}
            >
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${zoom ? 'scale-150' : 'scale-100 group-hover:scale-[1.04]'}`}
                />
              ) : <PlaceholderImg />}

              {/* Sale badge */}
              {product.isOnSale && discount > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-[#e63946] text-[#ffffff] text-[11px] font-black tracking-[0.1em] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  SALE -{discount}%
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#555] text-[16px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomInOutlined />
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImg(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1a1a1a] border-none cursor-pointer shadow-md hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <LeftOutlined />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImg(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1a1a1a] border-none cursor-pointer shadow-md hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <RightOutlined />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                      className={`rounded-full border-none cursor-pointer transition-all duration-200 ${
                        i === activeImg ? 'w-5 h-2 bg-[#1a1a1a]' : 'w-2 h-2 bg-[#1a1a1a]/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-[calc(25%-9px)] aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 bg-[#f8f8f8] p-0 ${
                      i === activeImg ? 'border-[#1a1a1a] shadow-md' : 'border-transparent hover:border-[#d0d0d0]'
                    }`}
                  >
                    {img ? (
                      <img src={img} alt={`Góc nhìn ${i + 1}`} className="w-full h-full object-cover" />
                    ) : <PlaceholderImg />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info (45%) ── */}
          <div className="flex-1 min-w-0 py-2">

            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#aaa]">{categoryLabel}</span>

            <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-[-0.02em] leading-[1.15] mt-2 mb-3 font-['Inter']">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-5">
              <Stars rating={product.rating} size={15} />
              <span className="text-[14px] font-bold text-[#1a1a1a]">{product.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-[#ccc]">|</span>
              <a href="#reviews" className="text-[13px] text-[#888] hover:text-[#1a1a1a] transition-colors">
                {product.reviewCount} đánh giá
              </a>
              <span className="text-[#ccc]">|</span>
              <a href="#reviews" className="text-[13px] text-[#1a1a1a] font-semibold hover:underline">Xem đánh giá</a>
            </div>

            {/* Price block */}
            <div className="bg-[#fafafa] rounded-xl p-4 mb-5 border border-[#f0f0f0]">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[30px] font-black text-[#1a1a1a]">{formatPrice(product.price)}</span>
                {product.originalPrice && product.isOnSale && (
                  <span className="text-[18px] text-[#ccc] line-through">{formatPrice(product.originalPrice)}</span>
                )}
                {product.isOnSale && discount > 0 && (
                  <span className="bg-[#dcfce7] text-[#166534] text-[12px] font-bold px-2.5 py-1 rounded-full">
                    Tiết kiệm {formatPrice(product.originalPrice - product.price)}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#888] mt-1.5 m-0">Giá đã bao gồm VAT. Miễn phí ship đơn trên 500K.</p>
            </div>

            <div className="w-full h-px bg-[#f0f0f0] mb-5" />

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#666]">Màu sắc:</span>
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">{colors[selectedColor]?.name}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setColor(i);
                        // Nếu màu có ảnh riêng → dùng ảnh đó, không → nhảy tới images[i]
                        const cImgs = color.images;
                        if (cImgs?.length) {
                          setActiveImg(0);
                        } else {
                          setActiveImg(Math.min(i, allImages.length - 1));
                        }
                      }}
                      title={color.name}
                      className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110 relative ${
                        i === selectedColor
                          ? 'border-[#1a1a1a] shadow-[0_0_0_3px_rgba(26,26,26,0.15)]'
                          : 'border-transparent hover:border-[#d0d0d0]'
                      }`}
                      style={{ backgroundColor: color.code }}
                    >
                      {color.code === '#f5f5f5' && (
                        <span className="absolute inset-0 rounded-full border border-[#e0e0e0]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#666]">Size:</span>
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{sizes[selectedSize]?.label}</span>
                  </div>
                  <a href="#size-guide" className="text-[12px] text-[#888] hover:text-[#1a1a1a] transition-colors underline">
                    Hướng Dẫn Chọn Size →
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  {sizes.map((size, i) => (
                    <button
                      key={i}
                      onClick={() => size.available && setSize(i)}
                      disabled={!size.available}
                      className={`min-w-[50px] h-[44px] px-3 rounded-lg border text-[13px] font-bold cursor-pointer transition-all duration-200 relative ${
                        !size.available
                          ? 'border-[#e8e8e8] text-[#ccc] cursor-not-allowed bg-[#fafafa]'
                          : i === selectedSize
                            ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-md'
                            : 'border-[#d5d5d5] text-[#1a1a1a] bg-white hover:border-[#1a1a1a]'
                      }`}
                    >
                      {!size.available ? <span className="line-through">{size.label}</span> : size.label}
                      {!size.available && (
                        <span className="absolute top-0.5 right-0.5 text-[8px] text-[#ccc] leading-none">hết</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#666]">Số Lượng:</span>
              <div className="flex items-center border border-[#d5d5d5] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[18px] text-[#1a1a1a] bg-white border-none cursor-pointer hover:bg-[#f5f5f5] transition-colors font-bold"
                >−</button>
                <span className="w-12 h-10 flex items-center justify-center text-[15px] font-bold text-[#1a1a1a] border-x border-[#e5e5e5]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[18px] text-[#1a1a1a] bg-white border-none cursor-pointer hover:bg-[#f5f5f5] transition-colors font-bold"
                >+</button>
              </div>
              {product.stock > 0 && (
                <span className="text-[13px] text-[#888]">Còn {product.stock} sản phẩm</span>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 mb-5">
              <button
                onClick={handleCart}
                className="w-full h-[52px] flex items-center justify-center gap-2 text-[14px] font-bold text-white bg-[#1a1a1a] rounded-xl border-none cursor-pointer transition-all duration-200 hover:bg-[#333] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] tracking-[0.04em]"
              >
                <ShoppingCartOutlined className="text-[16px]" />
                THÊM VÀO GIỎ HÀNG
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full h-[48px] flex items-center justify-center gap-2 text-[14px] font-bold text-[#1a1a1a] bg-white rounded-xl border-2 border-[#1a1a1a] cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] hover:text-white tracking-[0.04em]"
              >
                <ThunderboltOutlined className="text-[16px]" />
                MUA NGAY
              </button>
            </div>

            {/* Wishlist & Compare */}
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={() => { setWished(!wished); message.info(wished ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích ❤️'); }}
                className={`flex items-center gap-1.5 text-[13px] font-semibold bg-transparent border-none cursor-pointer transition-colors hover:opacity-80 ${wished ? 'text-[#e63946]' : 'text-[#888]'}`}
              >
                {wished ? <HeartFilled /> : <HeartOutlined />}
                Thêm vào yêu thích
              </button>
              <div className="w-px h-4 bg-[#e5e5e5]" />
              <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#888] bg-transparent border-none cursor-pointer hover:text-[#1a1a1a] transition-colors">
                <SwapOutlined />
                So sánh sản phẩm
              </button>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[#fafafa] rounded-xl border border-[#f0f0f0]">
              {[
                { icon: <TruckOutlined />, text: 'Miễn Phí Ship' },
                { icon: <SafetyOutlined />, text: 'Bảo Hành' },
                { icon: <RetweetOutlined />, text: 'Đổi Trả 30 Ngày' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="text-[20px] text-[#1a1a1a]">{icon}</span>
                  <span className="text-[11px] font-semibold text-[#555] leading-tight">{text}</span>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="mt-6">
              <Collapse
                activeKey={activeAccordion}
                onChange={setAccordion}
                ghost
                className="border border-[#f0f0f0] rounded-xl overflow-hidden"
                items={[
                  {
                    key: 'desc',
                    label: <span className="text-[13px] font-bold text-[#1a1a1a] tracking-[0.02em]">Mô Tả Sản Phẩm</span>,
                    children: (
                      <p className="text-[13px] text-[#555] leading-7 whitespace-pre-line m-0">
                        {product.description || 'Chưa có mô tả.'}
                      </p>
                    ),
                  },
                  {
                    key: 'material',
                    label: <span className="text-[13px] font-bold text-[#1a1a1a] tracking-[0.02em]">Chất Liệu & Chăm Sóc</span>,
                    children: (
                      <p className="text-[13px] text-[#555] leading-7 m-0">
                        {product.material || 'Chưa có thông tin chất liệu.'}
                      </p>
                    ),
                  },
                  {
                    key: 'size-guide',
                    id:  'size-guide',
                    label: <span className="text-[13px] font-bold text-[#1a1a1a] tracking-[0.02em]">Bảng Size</span>,
                    children: (
                      <pre className="text-[13px] text-[#555] leading-7 m-0 font-['Inter'] whitespace-pre-wrap">
                        {product.sizeGuide || 'Chưa có bảng size.'}
                      </pre>
                    ),
                  },
                  {
                    key: 'reviews-acc',
                    label: <span className="text-[13px] font-bold text-[#1a1a1a] tracking-[0.02em]">Đánh Giá ({product.reviewCount})</span>,
                    children: (
                      <a href="#reviews" className="text-[13px] text-[#1a1a1a] font-semibold underline">Xem tất cả đánh giá →</a>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <section id="reviews" className="bg-[#fafafa] py-16 border-t border-[#ebebeb]">
        <div className="container-custom">
          <h2 className="text-[28px] font-black text-[#1a1a1a] tracking-[-0.02em] mb-10">Đánh Giá Khách Hàng</h2>

          <div className="flex gap-12 items-start mb-12">
            {/* Average score */}
            <div className="flex flex-col items-center shrink-0 bg-white rounded-2xl p-8 border border-[#f0f0f0] shadow-sm min-w-[200px]">
              <span className="text-[72px] font-black text-[#1a1a1a] leading-none">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
              <Stars rating={product.rating} size={20} />
              <span className="text-[13px] text-[#888] mt-2">{product.reviewCount} đánh giá</span>
            </div>

            {/* Breakdown bars */}
            <div className="flex-1 flex flex-col gap-3 justify-center">
              {(ratingBreakdown.length ? ratingBreakdown : [5,4,3,2,1].map((s) => ({ star: s, percent: 0 }))).map(
                ({ star, percent }) => (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-8 shrink-0">
                      <span className="text-[13px] font-semibold text-[#555]">{star}</span>
                      <StarFilled style={{ fontSize: 12, color: '#d4af37' }} />
                    </div>
                    <div className="flex-1 h-2.5 bg-[#ebebeb] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#d4af37] rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[12px] text-[#aaa] w-8 text-right">{percent}%</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Review cards */}
          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} />} />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-[#aaa]">
              <StarFilled style={{ fontSize: 40, color: '#e5e5e5' }} />
              <p className="mt-3 text-[15px]">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl p-6 border border-[#f0f0f0] shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[14px] font-bold shrink-0">
                      {review.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-bold text-[#1a1a1a]">{review.name}</span>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-[11px] text-[#166534] font-semibold">
                            <CheckCircleFilled style={{ fontSize: 11 }} /> Đã mua
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#aaa]">{review.date}</span>
                    </div>
                  </div>

                  <Stars rating={review.rating} size={13} />
                  <p className="text-[13px] text-[#555] leading-6 m-0">{review.text}</p>

                  <button
                    onClick={() => handleHelpful(review._id, id)}
                    className={`flex items-center gap-1.5 text-[12px] font-semibold mt-auto bg-transparent border border-[#e5e5e5] rounded-full px-3 py-1.5 cursor-pointer transition-all self-start ${
                      helpfulIds.includes(review._id)
                        ? 'text-[#1a1a1a] border-[#1a1a1a] bg-[#f5f5f5]'
                        : 'text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                    }`}
                  >
                    <LikeOutlined />
                    Hữu ích ({helpfulIds.includes(review._id) ? (review.helpful || 0) + 1 : (review.helpful || 0)})
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <section className="bg-white section-py border-t border-[#ebebeb]">
          <div className="container-custom">
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="text-[28px] font-black text-[#1a1a1a] tracking-[-0.02em]">Sản Phẩm Tương Tự</h2>
              <Link
                to="/products"
                className="text-[14px] font-semibold text-[#1a1a1a] no-underline border-b border-transparent hover:border-[#1a1a1a] transition-all shrink-0 ml-6"
              >
                Xem Tất Cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetailPage;
