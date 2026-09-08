// ============================================================
// CartPage — Full shopping cart page with order summary
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  TagOutlined,
  CheckCircleFilled,
  SafetyOutlined,
} from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { fetchProducts } from '../../api/productService';
import ProductCard from '../ProductsPage/components/ProductCard';

/* ─── Helper ────────────────────────────────────────────────── */
const formatPrice = (n) =>
  new Intl.NumberFormat('vi-VN').format(n) + 'đ';

/* ─── Step Indicator ───────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'GIỎ HÀNG' },
  { id: 2, label: 'THÔNG TIN' },
  { id: 3, label: 'THANH TOÁN' },
];
const StepIndicator = ({ current = 1 }) => (
  <div className="flex items-center justify-center gap-0 mt-6 mb-10">
    {STEPS.map((step, idx) => {
      const active = step.id === current;
      const done   = step.id < current;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all ${
                active
                  ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white'
                  : done
                  ? 'bg-[#2d6a4f] border-[#2d6a4f] text-white'
                  : 'bg-white border-[#ccc] text-[#ccc]'
              }`}
            >
              {done ? <CheckCircleFilled /> : step.id}
            </div>
            <span
              className={`text-[11px] font-semibold tracking-[0.08em] ${
                active ? 'text-[#1a1a1a]' : done ? 'text-[#2d6a4f]' : 'text-[#ccc]'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`h-[2px] w-16 mx-1 mb-5 transition-all ${
                done ? 'bg-[#2d6a4f]' : 'bg-[#e5e5e5]'
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ─── Qty Stepper ───────────────────────────────────────────── */
const QtyStepper = ({ value, onMinus, onPlus, disabled }) => (
  <div className="flex items-center border border-[#ddd] rounded-lg overflow-hidden">
    <button
      onClick={onMinus}
      disabled={disabled || value <= 1}
      className="w-9 h-9 flex items-center justify-center text-[#555] bg-transparent border-none cursor-pointer hover:bg-[#f5f5f5] transition disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label="Giảm số lượng"
    >
      <MinusOutlined style={{ fontSize: 11 }} />
    </button>
    <span className="w-10 h-9 flex items-center justify-center text-[13px] font-semibold text-[#1a1a1a] border-x border-[#ddd]">
      {value}
    </span>
    <button
      onClick={onPlus}
      disabled={disabled}
      className="w-9 h-9 flex items-center justify-center text-[#555] bg-transparent border-none cursor-pointer hover:bg-[#f5f5f5] transition disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label="Tăng số lượng"
    >
      <PlusOutlined style={{ fontSize: 11 }} />
    </button>
  </div>
);

/* ─── Cart Item Row ─────────────────────────────────────────── */
const CartItemRow = ({ item, onQtyChange, onRemove, busy }) => {
  const product  = item.product || {};
  const qty      = item.quantity || 1;
  const price    = product.price || 0;
  const name     = product.name || 'Sản phẩm';
  const image    = product.images?.[0] || product.image || '/placeholder.png';
  const size     = item.size   || product.selectedSize  || 'M';
  const color    = item.color  || product.selectedColor || 'Mặc định';

  return (
    <div className="flex gap-4 py-5 group">
      {/* Thumbnail */}
      <Link to={`/products/${product._id || product.id}`} className="shrink-0">
        <div className="w-[88px] h-[88px] rounded-xl overflow-hidden bg-[#f8f8f8] border border-[#f0f0f0]">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <Link
          to={`/products/${product._id || product.id}`}
          className="text-[14px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2 hover:text-[#555] transition-colors no-underline"
        >
          {name}
        </Link>
        <p className="text-[12px] text-[#888] m-0">
          Size: <span className="font-medium text-[#555]">{size}</span>
          {' '}|{' '}
          Màu: <span className="font-medium text-[#555]">{color}</span>
        </p>
        <p className="text-[13px] font-semibold text-[#1a1a1a] m-0 mt-0.5">
          {formatPrice(price)}
        </p>
      </div>

      {/* Qty + Subtotal + Remove */}
      <div className="flex flex-col items-end justify-between shrink-0 gap-2">
        <button
          onClick={() => onRemove(product._id || product.id)}
          disabled={busy}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#ccc] hover:text-[#e63946] hover:bg-[#fff0f0] border-none bg-transparent cursor-pointer transition-all disabled:opacity-50"
          aria-label="Xóa sản phẩm"
        >
          <DeleteOutlined style={{ fontSize: 13 }} />
        </button>
        <QtyStepper
          value={qty}
          onMinus={() => onQtyChange(product._id || product.id, qty - 1)}
          onPlus={() => onQtyChange(product._id || product.id, qty + 1)}
          disabled={busy}
        />
        <span className="text-[15px] font-bold text-[#1a1a1a]">
          {formatPrice(price * qty)}
        </span>
      </div>
    </div>
  );
};

/* ─── Payment Method Icons ──────────────────────────────────── */
const PaymentBadges = () => {
  const methods = [
    { name: 'Visa',       bg: '#1A1F71', text: '#fff',    label: 'VISA' },
    { name: 'Mastercard', bg: '#EB001B', text: '#fff',    label: 'MC' },
    { name: 'MoMo',       bg: '#A50064', text: '#fff',    label: 'MoMo' },
    { name: 'ZaloPay',    bg: '#0068FF', text: '#fff',    label: 'Zalo' },
    { name: 'COD',        bg: '#f5f5f5', text: '#1a1a1a', label: 'COD' },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center mt-3">
      {methods.map((m) => (
        <div
          key={m.name}
          className="h-6 px-2.5 rounded-md flex items-center justify-center text-[10px] font-bold tracking-wider"
          style={{ backgroundColor: m.bg, color: m.text }}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
};

/* ─── Empty Cart ────────────────────────────────────────────── */
const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
    <div className="w-20 h-20 rounded-full bg-[#f5f5f5] flex items-center justify-center">
      <ShoppingOutlined style={{ fontSize: 36, color: '#ccc' }} />
    </div>
    <div>
      <h2 className="text-[20px] font-bold text-[#1a1a1a] m-0 mb-2">Giỏ hàng trống</h2>
      <p className="text-[14px] text-[#888] m-0">Hãy khám phá và thêm những sản phẩm bạn yêu thích!</p>
    </div>
    <Link
      to="/products"
      className="h-11 px-7 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-xl flex items-center gap-2 no-underline hover:bg-[#333] transition-colors"
    >
      <ShoppingOutlined />
      Khám Phá Ngay
    </Link>
  </div>
);

/* ─── Discount Codes ────────────────────────────────────────── */
const VALID_COUPONS = {
  HUGOCLO10: { type: 'percent', value: 10, label: '-10%' },
  FREESHIP:  { type: 'fixed',   value: 0,  label: 'Free Ship', freeShip: true },
  SAVE50K:   { type: 'fixed',   value: 50000, label: '-50,000đ' },
};

/* ─── CartPage ──────────────────────────────────────────────── */
const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, loading } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [busy,         setBusy]        = useState(false);
  const [couponInput,  setCoupon]      = useState('');
  const [appliedCode,  setApplied]     = useState(null);
  const [couponError,  setCouponError] = useState('');
  const [relatedProds, setRelated]     = useState([]);

  // Sử dụng cartItems trực tiếp từ context (đã sync từ server)
  const items = cartItems;

  // Fetch suggested products
  useEffect(() => {
    fetchProducts({ limit: 4 })
      .then((d) => setRelated(d?.products?.slice(0, 4) || []))
      .catch(() => {});
  }, []);

  /* Quantities — dùng updateQuantity từ CartContext */
  const handleQtyChange = async (productId, newQty) => {
    if (!productId || newQty < 1) return;
    setBusy(true);
    await updateQuantity(productId, newQty);
    setBusy(false);
  };

  /* Remove — dùng removeFromCart từ CartContext */
  const handleRemove = async (productId) => {
    if (!productId) return;
    setBusy(true);
    await removeFromCart(productId);
    setBusy(false);
  };

  /* Coupon */
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Vui lòng nhập mã giảm giá'); return; }
    const coupon = VALID_COUPONS[code];
    if (!coupon) {
      setCouponError('Mã giảm giá không hợp lệ');
      setApplied(null);
      return;
    }
    setApplied({ code, ...coupon });
    setCouponError('');
    message.success('Áp dụng mã giảm giá thành công!');
  };

  const handleRemoveCoupon = () => {
    setApplied(null);
    setCoupon('');
    setCouponError('');
  };

  /* Calculations */
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const qty   = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const shippingFee = subtotal >= 500000 ? 0 : 30000;

  let discountAmt = 0;
  if (appliedCode) {
    if (appliedCode.type === 'percent') {
      discountAmt = Math.round(subtotal * appliedCode.value / 100);
    } else {
      discountAmt = appliedCode.value;
    }
  }
  const isFreeShip = appliedCode?.freeShip;
  const finalShipping = isFreeShip ? 0 : shippingFee;
  const total = subtotal - discountAmt + finalShipping;

  /* Checkout */
  const handleCheckout = () => {
    if (!isLoggedIn) {
      message.info('Vui lòng đăng nhập để tiến hành thanh toán');
      navigate('/auth');
      return;
    }
    message.info('Tính năng thanh toán đang được phát triển');
  };

  // Normalize items for display (handle both API structure and local fallback)
  const displayItems = items.map((item) => {
    if (typeof item.product === 'object') return item;
    return { ...item, product: { _id: item.product, name: 'Sản phẩm', price: 0 } };
  });

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* ── Page Title + Steps ── */}
      <div className="bg-white border-b border-[#f0f0f0]">
        <div className="container-custom py-6">
          <h1 className="text-[32px] font-bold text-[#1a1a1a] text-center tracking-[-0.02em] m-0">
            GIỎ HÀNG
          </h1>
          <StepIndicator current={1} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container-custom py-10">
        {displayItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0]">
            <EmptyCart />
          </div>
        ) : (
          <div className="flex gap-7 items-start" style={{ flexWrap: 'wrap' }}>
            {/* ── Left Column — Cart Items ── */}
            <div className="flex-1 min-w-0" style={{ minWidth: 'min(100%, 460px)' }}>
              <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5f5f5]">
                  <h2 className="text-[15px] font-bold text-[#1a1a1a] tracking-wide m-0">
                    {displayItems.length} Sản Phẩm
                  </h2>
                  <span className="text-[12px] text-[#888]">Tạm tính: <strong className="text-[#1a1a1a]">{formatPrice(subtotal)}</strong></span>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#f5f5f5] px-6">
                  {displayItems.map((item, idx) => (
                    <CartItemRow
                      key={item.product?._id || item.product?.id || idx}
                      item={item}
                      onQtyChange={handleQtyChange}
                      onRemove={handleRemove}
                      busy={busy}
                    />
                  ))}
                </div>

                {/* Continue shopping */}
                <div className="px-6 py-4 border-t border-[#f5f5f5]">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#555] hover:text-[#1a1a1a] no-underline transition-colors group"
                  >
                    <ArrowLeftOutlined className="transition-transform group-hover:-translate-x-0.5" />
                    Tiếp Tục Mua Sắm
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Right Column — Order Summary ── */}
            <div className="w-full" style={{ maxWidth: 380 }}>
              <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm overflow-hidden sticky top-[120px]">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-[#f5f5f5]">
                  <h2 className="text-[14px] font-bold text-[#1a1a1a] tracking-[0.08em] uppercase m-0">
                    Tóm Tắt Đơn Hàng
                  </h2>
                </div>

                <div className="px-6 py-4 flex flex-col gap-4">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#666]">Tạm Tính</span>
                    <span className="text-[14px] font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#666]">Phí Vận Chuyển</span>
                    {finalShipping === 0 ? (
                      <span className="text-[12px] font-bold text-[#2d6a4f] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full">
                        MIỄN PHÍ
                      </span>
                    ) : (
                      <span className="text-[14px] font-semibold text-[#1a1a1a]">{formatPrice(finalShipping)}</span>
                    )}
                  </div>

                  {/* Shipping notice */}
                  {subtotal < 500000 && !isFreeShip && (
                    <p className="text-[11px] text-[#2d6a4f] bg-[#f0faf4] rounded-lg px-3 py-2 m-0 border border-[#c8e6c9]">
                      🎁 Thêm <strong>{formatPrice(500000 - subtotal)}</strong> để được miễn phí vận chuyển!
                    </p>
                  )}

                  {/* Coupon input */}
                  <div>
                    {appliedCode ? (
                      <div className="flex items-center justify-between bg-[#f0faf4] border border-[#c8e6c9] rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <TagOutlined className="text-[#2d6a4f]" />
                          <span className="text-[13px] font-semibold text-[#2d6a4f]">
                            {appliedCode.code}
                          </span>
                          <span className="text-[12px] text-[#555]">
                            ({appliedCode.label})
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-[11px] text-[#e63946] hover:underline bg-transparent border-none cursor-pointer p-0"
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <TagOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] text-[13px]" />
                          <input
                            id="coupon-input"
                            type="text"
                            value={couponInput}
                            onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            placeholder="Mã giảm giá"
                            className="w-full h-10 pl-9 pr-3 text-[13px] border border-[#e5e5e5] rounded-xl outline-none focus:border-[#1a1a1a] transition-colors"
                          />
                        </div>
                        <button
                          onClick={handleApplyCoupon}
                          className="h-10 px-4 text-[12px] font-bold bg-[#1a1a1a] text-white rounded-xl border-none cursor-pointer hover:bg-[#333] transition-colors whitespace-nowrap"
                        >
                          Áp Dụng
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-[#e63946] m-0 mt-1.5">{couponError}</p>
                    )}
                  </div>

                  {/* Discount */}
                  {discountAmt > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#2d6a4f] font-medium">Giảm Giá ({appliedCode?.label})</span>
                      <span className="text-[14px] font-bold text-[#2d6a4f]">-{formatPrice(discountAmt)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="px-6 py-4 border-t-2 border-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-[#1a1a1a] uppercase tracking-[0.04em]">Tổng Cộng</span>
                    <span className="text-[24px] font-black text-[#1a1a1a] tracking-[-0.02em]">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888] m-0 mt-1">Đã bao gồm thuế VAT (nếu có)</p>
                </div>

                {/* Checkout button */}
                <div className="px-6 pb-6 flex flex-col gap-3">
                  <button
                    id="checkout-btn"
                    onClick={handleCheckout}
                    className="w-full h-13 text-[14px] font-bold text-white bg-[#1a1a1a] rounded-xl border-none cursor-pointer hover:bg-[#333] active:scale-[0.98] transition-all tracking-[0.04em] uppercase flex items-center justify-center gap-2"
                    style={{ height: 52 }}
                  >
                    <LockOutlined />
                    Tiến Hành Thanh Toán
                  </button>

                  {/* Secure note */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#888]">
                    <SafetyOutlined className="text-[#2d6a4f]" />
                    <span>Thanh toán bảo mật SSL 256-bit</span>
                  </div>

                  {/* Payment methods */}
                  <PaymentBadges />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Cross-Sell Section ── */}
        {relatedProds.length > 0 && (
          <section className="mt-16" aria-label="Gợi ý sản phẩm">
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-[22px] font-bold text-[#1a1a1a] tracking-[-0.01em] m-0">
                Có Thể Bạn Thích
              </h2>
              <Link
                to="/products"
                className="text-[13px] font-semibold text-[#555] hover:text-[#1a1a1a] no-underline border-b border-transparent hover:border-[#1a1a1a] transition-all pb-0.5"
              >
                Xem Tất Cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProds.map((p) => {
                const normalized = {
                  _id:          p._id,
                  id:           p._id,
                  name:         p.name,
                  price:        p.price,
                  originalPrice: p.originalPrice,
                  image:        p.images?.[0] || p.image || '',
                  images:       p.images || [],
                  category:     p.category?.name || p.category || '',
                  isOnSale:     p.isOnSale,
                  rating:       p.rating || 0,
                  reviewCount:  p.reviewCount || 0,
                };
                return <ProductCard key={p._id} product={normalized} />;
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CartPage;
