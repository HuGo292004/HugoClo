// ============================================================
// OrderConfirmModal — Xác nhận đơn hàng trước khi submit
// ============================================================

import React from 'react';
import { Modal, Button } from 'antd';
import { CheckCircleFilled, CarOutlined, CreditCardOutlined } from '@ant-design/icons';

const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';

const METHOD_INFO = {
  cod:   { label: 'Thanh toán khi nhận hàng (COD)', color: '#555',    bg: '#f5f5f5' },
  vnpay: { label: 'VNPay',                           color: '#fff',    bg: '#005BAA' },
  momo:  { label: 'Ví MoMo',                         color: '#fff',    bg: '#A50064' },
};

const OrderConfirmModal = ({ open, onCancel, onConfirm, loading, orderData }) => {
  if (!orderData) return null;

  const {
    shippingAddress = {},
    paymentMethod   = 'cod',
    subtotal        = 0,
    shippingFee     = 30000,
    discountAmt     = 0,
    total           = 0,
    items           = [],
  } = orderData;

  const method = METHOD_INFO[paymentMethod] || METHOD_INFO.cod;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <span className="text-[18px] font-semibold text-[#1a1a1a]">
          Xác Nhận Đơn Hàng
        </span>
      }
      width={520}
      footer={
        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel} size="large" disabled={loading}>
            Quay Lại
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={onConfirm}
            className="bg-[#1a1a1a] border-[#1a1a1a] hover:bg-[#333] hover:border-[#333]"
          >
            {paymentMethod === 'cod' ? 'Đặt Hàng Ngay' : 'Tiếp Tục Thanh Toán'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 mt-4">
        {/* Địa chỉ giao hàng */}
        <div className="bg-[#f9f9f9] rounded-xl p-4 border border-[#f0f0f0]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] m-0 mb-2">Giao Đến</p>
          <p className="font-bold text-[14px] text-[#1a1a1a] m-0">{shippingAddress.fullName}</p>
          <p className="text-[13px] text-[#666] m-0">{shippingAddress.phone}</p>
          <p className="text-[13px] text-[#666] m-0">
            {[shippingAddress.address, shippingAddress.ward, shippingAddress.district, shippingAddress.city]
              .filter(Boolean).join(', ')}
          </p>
          {shippingAddress.note && (
            <p className="text-[12px] text-[#aaa] m-0 mt-1 italic">{shippingAddress.note}</p>
          )}
        </div>

        {/* PTTT */}
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#888]">Phương thức:</span>
          <span
            className="text-[12px] font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: method.bg, color: method.color }}
          >
            {method.label}
          </span>
        </div>

        {/* Tóm tắt giá */}
        <div className="border-t border-[#f0f0f0] pt-4 flex flex-col gap-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#666]">Tạm tính ({items.length} sản phẩm)</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#666]">Phí vận chuyển</span>
            <span className="font-semibold">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
          </div>
          {discountAmt > 0 && (
            <div className="flex justify-between text-[13px]">
              <span className="text-[#2d6a4f]">Giảm giá</span>
              <span className="font-bold text-[#2d6a4f]">-{formatPrice(discountAmt)}</span>
            </div>
          )}
          <div className="flex justify-between text-[15px] font-black border-t border-[#1a1a1a] pt-3 mt-1">
            <span>Tổng Cộng</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {paymentMethod !== 'cod' && (
          <p className="text-[12px] text-[#888] bg-[#fffbf0] border border-[#ffe4a0] rounded-lg p-3 m-0">
            Bạn sẽ được chuyển đến trang thanh toán <strong>{method.label}</strong>. Đơn hàng chỉ được xác nhận sau khi thanh toán thành công.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default OrderConfirmModal;
