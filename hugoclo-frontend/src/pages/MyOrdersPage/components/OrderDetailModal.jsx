// ============================================================
// OrderDetailModal — Modal xem chi tiết đơn hàng
// ============================================================

import React from 'react';
import { Modal, Button, Tag } from 'antd';

const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
const formatDate  = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

const ORDER_STATUS_CONFIG = {
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

const OrderDetailModal = ({ open, onClose, order, onCancel }) => {
  if (!order) return null;

  const statusCfg  = ORDER_STATUS_CONFIG[order.orderStatus] || {};
  const paymentCfg = PAYMENT_STATUS[order.paymentStatus] || {};
  const canCancel  = ['pending', 'confirmed'].includes(order.orderStatus);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="text-[18px] font-bold text-[#1a1a1a]">
            Chi Tiết Đơn #{order._id?.slice(-8).toUpperCase()}
          </span>
          <Tag color={statusCfg.color} className="rounded-full font-semibold">
            {statusCfg.label}
          </Tag>
        </div>
      }
      width={640}
      footer={
        <div className="flex justify-between">
          {canCancel ? (
            <Button danger onClick={() => onCancel(order._id)}>Hủy Đơn Hàng</Button>
          ) : <span />}
          <Button onClick={onClose} size="large">Đóng</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 mt-4">
        {/* Info */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Ngày đặt',      value: formatDate(order.createdAt) },
            { label: 'Thanh toán',    value: `${METHOD_LABEL[order.paymentMethod] || order.paymentMethod}` },
            { label: 'T.thái T.toán', value: <Tag color={paymentCfg.color} className="rounded-full font-semibold m-0">{paymentCfg.label}</Tag> },
            { label: 'Vận chuyển',    value: order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#f9f9f9] rounded-xl p-3 border border-[#f0f0f0]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaa] m-0">{label}</p>
              <p className="text-[13px] font-semibold text-[#1a1a1a] m-0 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Shipping address */}
        <div className="bg-[#f9f9f9] rounded-xl p-4 border border-[#f0f0f0]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] m-0 mb-2">Địa chỉ giao hàng</p>
          <p className="font-bold text-[14px] text-[#1a1a1a] m-0">{order.shippingAddress?.fullName}</p>
          <p className="text-[13px] text-[#666] m-0">{order.shippingAddress?.phone}</p>
          <p className="text-[13px] text-[#666] m-0">
            {[
              order.shippingAddress?.address,
              order.shippingAddress?.ward,
              order.shippingAddress?.district,
              order.shippingAddress?.city,
            ].filter(Boolean).join(', ')}
          </p>
          {order.shippingAddress?.note && (
            <p className="text-[12px] text-[#aaa] italic m-0 mt-1">{order.shippingAddress.note}</p>
          )}
        </div>

        {/* Items */}
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#aaa] mb-3 m-0">Sản phẩm</p>
          <div className="flex flex-col gap-3 max-h-[240px] overflow-y-auto">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={item.image || 'https://via.placeholder.com/48'}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover border border-[#f0f0f0] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1a1a1a] m-0 line-clamp-2">{item.name}</p>
                  <p className="text-[12px] text-[#888] m-0">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
                <span className="text-[13px] font-bold text-[#1a1a1a] shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-[#1a1a1a] pt-4 flex flex-col gap-2">
          {[
            { label: 'Tạm tính',     value: formatPrice(order.subtotal) },
            { label: 'Phí ship',     value: order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee) },
            order.discountAmt > 0 && { label: 'Giảm giá', value: `-${formatPrice(order.discountAmt)}`, green: true },
          ].filter(Boolean).map(({ label, value, green }) => (
            <div key={label} className="flex justify-between text-[13px]">
              <span className={green ? 'text-[#2d6a4f]' : 'text-[#666]'}>{label}</span>
              <span className={`font-semibold ${green ? 'text-[#2d6a4f]' : 'text-[#1a1a1a]'}`}>{value}</span>
            </div>
          ))}
          <div className="flex justify-between text-[16px] font-black mt-1">
            <span>Tổng Cộng</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
