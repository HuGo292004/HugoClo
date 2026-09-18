// ============================================================
// OrderSuccessPage — Trang thành công / thất bại sau thanh toán
// ============================================================

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  HomeOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { fetchOrderById } from '../../api/orderService';
import { useCart } from '../../context/CartContext';

const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
const formatDate  = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

const METHOD_LABEL = { cod: 'COD', vnpay: 'VNPay', momo: 'MoMo' };
const STATUS_LABEL = {
  pending:   'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping:  'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
};

const OrderSuccessPage = () => {
  const [params]  = useSearchParams();
  const orderId   = params.get('orderId');
  const method    = params.get('method');
  const status    = params.get('status'); // 'error' | 'failed' | undefined (success)

  const { fetchCart } = useCart();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);

  const isSuccess = !status || status === 'ok';

  useEffect(() => {
    if (!orderId || !isSuccess) return;
    setLoading(true);
    fetchOrderById(orderId)
      .then((data) => {
        setOrder(data);
        fetchCart(); // Sync the empty cart from the backend
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId, isSuccess, fetchCart]);

  /* ── Failed ── */
  if (!isSuccess) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-10 text-center max-w-[480px] w-full mx-4">
          <CloseCircleFilled className="text-[64px] text-red-500 mb-5" style={{ fontSize: 64 }} />
          <h1 className="text-[24px] font-black text-[#1a1a1a] m-0 mb-3">Thanh Toán Thất Bại</h1>
          <p className="text-[#888] text-[14px] m-0 mb-8">
            Đơn hàng của bạn chưa được xác nhận. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/cart"
              className="h-[48px] bg-[#1a1a1a] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 no-underline hover:bg-[#333] transition-colors"
            >
              <ShoppingOutlined /> Quay Lại Giỏ Hàng
            </Link>
            <Link
              to="/"
              className="h-[48px] border border-[#e5e5e5] text-[#555] rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 no-underline hover:border-[#1a1a1a] transition-colors"
            >
              <HomeOutlined /> Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading order data ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} />} />
      </div>
    );
  }

  /* ── Success ── */
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="container-custom py-16 max-w-[680px]">
        {/* Success card */}
        <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm overflow-hidden">
          {/* Green banner */}
          <div className="bg-gradient-to-r from-[#2d6a4f] to-[#40916c] px-8 py-10 text-center">
            <CheckCircleFilled style={{ fontSize: 64, color: '#fff' }} />
            <h1 className="text-[28px] font-black text-white m-0 mt-4">Đặt Hàng Thành Công!</h1>
            <p className="text-white/80 text-[14px] m-0 mt-2">
              Cảm ơn bạn đã mua sắm tại HugoClo. Chúng tôi sẽ liên hệ sớm để xác nhận đơn hàng.
            </p>
          </div>

          <div className="p-8">
            {order ? (
              <>
                {/* Order info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Mã Đơn Hàng', value: `#${order._id?.slice(-8).toUpperCase()}` },
                    { label: 'Ngày Đặt',    value: formatDate(order.createdAt) },
                    { label: 'Phương Thức', value: METHOD_LABEL[order.paymentMethod] || order.paymentMethod },
                    { label: 'Trạng Thái',  value: STATUS_LABEL[order.orderStatus] || order.orderStatus },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#f9f9f9] rounded-xl p-4 border border-[#f0f0f0]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] m-0">{label}</p>
                      <p className="text-[14px] font-bold text-[#1a1a1a] m-0 mt-1">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                <div className="bg-[#f9f9f9] rounded-xl p-4 border border-[#f0f0f0] mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] m-0 mb-2">Giao Đến</p>
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
                </div>

                {/* Items */}
                <div className="mb-6">
                  <p className="text-[13px] font-bold text-[#1a1a1a] mb-3">Sản phẩm đã đặt</p>
                  <div className="flex flex-col gap-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://via.placeholder.com/48'}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-[#f0f0f0] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1a1a1a] m-0 line-clamp-1">{item.name}</p>
                          <p className="text-[12px] text-[#888] m-0">x{item.quantity}</p>
                        </div>
                        <span className="text-[13px] font-bold text-[#1a1a1a] shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-[#1a1a1a] pt-4 flex justify-between items-center">
                  <span className="font-bold text-[15px] text-[#1a1a1a]">Tổng Cộng</span>
                  <span className="font-black text-[22px] text-[#1a1a1a]">{formatPrice(order.totalAmount)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-[#888]">
                <p>Đơn hàng đã được đặt thành công.</p>
                {orderId && <p className="text-[12px]">Mã đơn: #{orderId.slice(-8).toUpperCase()}</p>}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to="/my-orders"
                className="flex-1 h-[48px] bg-[#1a1a1a] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 no-underline hover:bg-[#333] transition-colors"
              >
                <FileTextOutlined /> Xem Đơn Hàng Của Tôi
              </Link>
              <Link
                to="/products"
                className="flex-1 h-[48px] border border-[#e5e5e5] text-[#555] rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 no-underline hover:border-[#1a1a1a] transition-colors"
              >
                <ShoppingOutlined /> Tiếp Tục Mua Sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
