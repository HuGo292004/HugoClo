// ============================================================
// CheckoutPage — Trang thanh toán 3 bước
// Bước 1: Giỏ hàng (CartPage)
// Bước 2: Thông tin giao hàng
// Bước 3: Phương thức thanh toán → Đặt hàng
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, ArrowRightOutlined } from '@ant-design/icons';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/orderService';

import ShippingForm from './components/ShippingForm';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import OrderSummaryPanel from './components/OrderSummaryPanel';
import OrderConfirmModal from './components/OrderConfirmModal';

/* ── Step indicator ─────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'GIỎ HÀNG' },
  { id: 2, label: 'THÔNG TIN' },
  { id: 3, label: 'THANH TOÁN' },
];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mt-6 mb-10">
    {STEPS.map((step, idx) => {
      const active = step.id === current;
      const done   = step.id < current;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all ${
              active ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white'
              : done  ? 'bg-[#2d6a4f] border-[#2d6a4f] text-white'
              : 'bg-white border-[#ccc] text-[#ccc]'
            }`}>
              {done ? <CheckCircleFilled /> : step.id}
            </div>
            <span className={`text-[11px] font-semibold tracking-[0.08em] ${
              active ? 'text-[#1a1a1a]' : done ? 'text-[#2d6a4f]' : 'text-[#ccc]'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`h-[2px] w-16 mx-1 mb-5 transition-all ${done ? 'bg-[#2d6a4f]' : 'bg-[#e5e5e5]'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── Validate shipping form ──────────────────────────────────── */
const validateShipping = (values) => {
  const errs = {};
  if (!values.fullName?.trim()) errs.fullName = 'Vui lòng nhập họ tên';
  if (!values.phone?.trim())    errs.phone    = 'Vui lòng nhập số điện thoại';
  else if (!/^0\d{9}$/.test(values.phone.replace(/\s/g, ''))) errs.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu 0)';
  if (!values.address?.trim())  errs.address  = 'Vui lòng nhập địa chỉ';
  if (!values.district?.trim()) errs.district = 'Vui lòng nhập quận/huyện';
  if (!values.city?.trim())     errs.city     = 'Vui lòng chọn tỉnh/thành phố';
  return errs;
};

/* ── Main ────────────────────────────────────────────────────── */
const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [step, setStep] = useState(2);   // Bắt đầu từ bước 2 (bước 1 là CartPage)

  const [shipping, setShipping] = useState({
    fullName: user?.fullName || '',
    phone:    user?.phone    || '',
    address:  '',
    ward:     '',
    district: '',
    city:     '',
    note:     '',
  });
  const [shippingErrors, setShippingErrors] = useState({});

  const [paymentMethod,  setPaymentMethod]  = useState('cod');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [placing,        setPlacing]        = useState(false);

  // Coupon from cart page (via localStorage nếu có)
  const [couponCode,   setCouponCode]   = useState('');
  const [discountAmt,  setDiscountAmt]  = useState(0);

  // Redirect nếu giỏ hàng trống
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  /* ── Calculations ── */
  const subtotal    = cartItems.reduce((s, item) => s + (item.product?.price || 0) * (item.quantity || 1), 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total       = subtotal - discountAmt + shippingFee;

  /* ── Step 2 → Step 3 ── */
  const handleNextStep = () => {
    const errs = validateShipping(shipping);
    setShippingErrors(errs);
    if (Object.keys(errs).length > 0) {
      message.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Open confirm modal ── */
  const handleOpenConfirm = () => {
    setConfirmVisible(true);
  };

  /* ── Place order ── */
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const { order, redirectUrl } = await createOrder({
        shippingAddress: shipping,
        paymentMethod,
        couponCode,
        discountAmt,
      });

      setConfirmVisible(false);

      if (redirectUrl) {
        // VNPay / MoMo → redirect đến cổng thanh toán
        window.location.href = redirectUrl;
      } else {
        // COD → trang thành công
        navigate(`/order-success?orderId=${order._id}&method=cod`);
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* ── Header ── */}
      <div className="bg-white border-b border-[#f0f0f0]">
        <div className="container-custom py-6">
          <h1 className="text-[32px] font-bold text-[#1a1a1a] text-center tracking-[-0.02em] m-0">
            THANH TOÁN
          </h1>
          <StepIndicator current={step} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container-custom py-10">
        <div className="flex gap-7 items-start" style={{ flexWrap: 'wrap' }}>

          {/* ── Left: Form ── */}
          <div className="flex-1 min-w-0" style={{ minWidth: 'min(100%, 460px)' }}>
            <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-6 md:p-8">

              {step === 2 && (
                <>
                  <ShippingForm
                    values={shipping}
                    onChange={setShipping}
                    errors={shippingErrors}
                  />

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#f5f5f5]">
                    <Link
                      to="/cart"
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#555] hover:text-[#1a1a1a] no-underline transition-colors"
                    >
                      <ArrowLeftOutlined /> Giỏ Hàng
                    </Link>
                    <button
                      onClick={handleNextStep}
                      className="px-8 h-[52px] text-[14px] font-bold text-white bg-[#1a1a1a] rounded-xl border-none cursor-pointer hover:bg-[#333] transition-all tracking-wider"
                    >
                      THANH TOÁN <ArrowRightOutlined className=""/>
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  {/* Recap thông tin giao hàng */}
                  <div className="mb-6 p-4 bg-[#f9f9f9] rounded-xl border border-[#f0f0f0] flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] m-0 mb-1">Giao Đến</p>
                      <p className="font-semibold text-[14px] text-[#1a1a1a] m-0">{shipping.fullName} · {shipping.phone}</p>
                      <p className="text-[13px] text-[#888] m-0">
                        {[shipping.address, shipping.ward, shipping.district, shipping.city].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="text-[12px] text-[#555] font-semibold bg-transparent border-none cursor-pointer hover:text-[#1a1a1a] underline shrink-0 ml-4"
                    >
                      Sửa
                    </button>
                  </div>

                  <PaymentMethodSelector
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                  />

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#f5f5f5]">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#555] hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer transition-colors"
                    >
                      <ArrowLeftOutlined /> Quay Lại
                    </button>
                    <button
                      onClick={handleOpenConfirm}
                      className="px-8 h-[52px] text-[14px] font-bold text-white bg-[#1a1a1a] rounded-xl border-none cursor-pointer hover:bg-[#333] transition-all tracking-wider"
                    >
                      {paymentMethod === 'cod' ? 'ĐẶT HÀNG NGAY' : 'TIẾN HÀNH THANH TOÁN'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Right: Summary ── */}
          <div className="w-full" style={{ maxWidth: 360 }}>
            <OrderSummaryPanel
              items={cartItems}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discountAmt={discountAmt}
              couponCode={couponCode}
              total={total}
              showButton={false}
            />
          </div>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <OrderConfirmModal
        open={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handlePlaceOrder}
        loading={placing}
        orderData={{
          shippingAddress: shipping,
          paymentMethod,
          subtotal,
          shippingFee,
          discountAmt,
          total,
          items: cartItems,
        }}
      />
    </div>
  );
};

export default CheckoutPage;
