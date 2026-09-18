// ============================================================
// OrderSummaryPanel — Panel bên phải tóm tắt đơn hàng
// ============================================================

import React from 'react';
import { LockOutlined, GiftFilled, TagOutlined } from '@ant-design/icons';

const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';

const OrderSummaryPanel = ({
  items = [],
  subtotal = 0,
  shippingFee = 30000,
  discountAmt = 0,
  couponCode = '',
  total = 0,
  isFreeShip = false,
  onCheckout,
  checkoutLoading = false,
  checkoutLabel = 'Đặt Hàng',
  showButton = true,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm overflow-hidden sticky top-[120px]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#f5f5f5]">
        <h2 className="text-[14px] font-bold text-[#1a1a1a] tracking-[0.08em] uppercase m-0">
          Tóm Tắt Đơn Hàng
        </h2>
      </div>

      {/* Items */}
      <div className="px-6 py-4 flex flex-col gap-3 max-h-[220px] overflow-y-auto border-b border-[#f5f5f5]">
        {items.map((item, idx) => {
          const product = item.product || {};
          const name    = product.name || item.name || 'Sản phẩm';
          const image   = product.images?.[0] || item.image || '';
          const price   = product.price || item.price || 0;
          const qty     = item.quantity || 1;
          return (
            <div key={product._id || idx} className="flex gap-3 items-center">
              <div className="relative shrink-0">
                <img
                  src={image || 'https://via.placeholder.com/48'}
                  alt={name}
                  className="w-12 h-12 rounded-lg object-cover border border-[#f0f0f0]"
                />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {qty}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#1a1a1a] m-0 line-clamp-2 leading-tight">{name}</p>
              </div>
              <span className="text-[13px] font-bold text-[#1a1a1a] shrink-0">{formatPrice(price * qty)}</span>
            </div>
          );
        })}
      </div>

      {/* Pricing */}
      <div className="px-6 py-4 flex flex-col gap-3">
        <div className="flex justify-between">
          <span className="text-[13px] text-[#666]">Tạm Tính</span>
          <span className="text-[14px] font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[#666]">Phí Vận Chuyển</span>
          {(isFreeShip || shippingFee === 0) ? (
            <span className="text-[12px] font-bold text-[#2d6a4f] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full">MIỄN PHÍ</span>
          ) : (
            <span className="text-[14px] font-semibold text-[#1a1a1a]">{formatPrice(shippingFee)}</span>
          )}
        </div>

        {subtotal < 500000 && !isFreeShip && shippingFee > 0 && (
          <p className="text-[11px] text-[#2d6a4f] bg-[#f0faf4] rounded-lg px-3 py-2 m-0 border border-[#c8e6c9]">
            <GiftFilled /> Thêm <strong>{formatPrice(500000 - subtotal)}</strong> để được miễn phí vận chuyển!
          </p>
        )}

        {discountAmt > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-[#2d6a4f] font-medium flex items-center gap-1">
              <TagOutlined /> {couponCode && `Mã: ${couponCode}`}
            </span>
            <span className="text-[14px] font-bold text-[#2d6a4f]">-{formatPrice(discountAmt)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="px-6 py-4 border-t-2 border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold text-[#1a1a1a] uppercase tracking-[0.04em]">Tổng Cộng</span>
          <span className="text-[24px] font-black text-[#1a1a1a] tracking-[-0.02em]">{formatPrice(total)}</span>
        </div>
        <p className="text-[11px] text-[#888] m-0 mt-1">Đã bao gồm thuế VAT (nếu có)</p>
      </div>

      {/* CTA */}
      {showButton && (
        <div className="px-6 pb-6">
          <button
            onClick={onCheckout}
            disabled={checkoutLoading}
            className="w-full h-[52px] text-[14px] font-bold text-white bg-[#1a1a1a] rounded-xl border-none cursor-pointer hover:bg-[#333] active:scale-[0.98] transition-all tracking-[0.04em] uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><LockOutlined /> {checkoutLabel}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummaryPanel;
