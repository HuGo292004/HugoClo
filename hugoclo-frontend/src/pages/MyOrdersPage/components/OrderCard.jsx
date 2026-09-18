// ============================================================
// OrderCard — Card hiển thị tóm tắt đơn hàng trong danh sách
// ============================================================

import React from 'react';
import { Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
const formatDate  = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const ORDER_STATUS = {
  pending:   { label: 'Chờ xác nhận', color: 'orange' },
  confirmed: { label: 'Đã xác nhận',  color: 'blue' },
  shipping:  { label: 'Đang giao',    color: 'cyan' },
  delivered: { label: 'Đã giao',      color: 'green' },
  cancelled: { label: 'Đã hủy',       color: 'red' },
};

const PAYMENT_STATUS = {
  pending:  { label: 'Chờ thanh toán', color: 'orange' },
  paid:     { label: 'Đã thanh toán',  color: 'green' },
  failed:   { label: 'Thất bại',       color: 'red' },
  refunded: { label: 'Hoàn tiền',      color: 'purple' },
};

const METHOD_LABEL = { cod: 'COD', vnpay: 'VNPay', momo: 'MoMo' };

const OrderCard = ({ order, onViewDetail }) => {
  const statusCfg  = ORDER_STATUS[order.orderStatus] || {};
  const firstItem  = order.items?.[0];
  const extraItems = (order.items?.length || 1) - 1;

  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f5f5f5] bg-[#fafafa]">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-mono text-[#888] font-semibold">
            #{order._id?.slice(-8).toUpperCase()}
          </span>
          <Tag color={statusCfg.color} className="rounded-full font-semibold text-[11px] m-0">
            {statusCfg.label}
          </Tag>
          {order.paymentStatus === 'paid' && (
            <Tag color="green" className="rounded-full font-semibold text-[11px] m-0">
              Đã thanh toán
            </Tag>
          )}
        </div>
        <span className="text-[12px] text-[#aaa]">{formatDate(order.createdAt)}</span>
      </div>

      {/* Content */}
      <div className="px-5 py-4 flex gap-4 items-center">
        {/* Product thumbnail */}
        <div className="relative shrink-0">
          <img
            src={firstItem?.image || 'https://via.placeholder.com/64'}
            alt={firstItem?.name}
            className="w-16 h-16 rounded-xl object-cover border border-[#f0f0f0]"
          />
          {extraItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              +{extraItems}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#1a1a1a] m-0 line-clamp-1">
            {firstItem?.name}
            {extraItems > 0 && <span className="text-[#aaa] font-normal"> +{extraItems} sản phẩm khác</span>}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[12px] text-[#888]">
              {order.items?.length} sản phẩm
            </span>
            <span className="text-[#e0e0e0]">·</span>
            <span className="text-[12px] text-[#888]">
              {METHOD_LABEL[order.paymentMethod] || order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[16px] font-black text-[#1a1a1a]">
            {formatPrice(order.totalAmount)}
          </span>
          <button
            onClick={() => onViewDetail(order)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#555] hover:text-[#1a1a1a] bg-[#f5f5f5] hover:bg-[#e5e5e5] border-none rounded-lg px-3 py-1.5 cursor-pointer transition-all"
          >
            <EyeOutlined /> Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
