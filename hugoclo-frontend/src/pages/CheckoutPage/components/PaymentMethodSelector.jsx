// ============================================================
// PaymentMethodSelector — Chọn phương thức thanh toán
// ============================================================

import React from 'react';
import { CheckCircleFilled, CarOutlined, CreditCardOutlined, LockOutlined } from '@ant-design/icons';

const METHODS = [
  {
    id: 'cod',
    label: 'Thanh Toán Khi Nhận Hàng (COD)',
    description: 'Trả tiền mặt khi shipper giao hàng đến tay bạn.',
    badge: { text: 'COD', bg: '#f5f5f5', color: '#1a1a1a' },
    icon: <CarOutlined style={{ fontSize: 22 }} />,
  },
  {
    id: 'vnpay',
    label: 'Thanh Toán Qua VNPay',
    description: 'Hỗ trợ thẻ ATM nội địa, thẻ Visa/Master, Internet Banking.',
    badge: { text: 'VNPay', bg: '#005BAA', color: '#fff' },
    icon: <CreditCardOutlined style={{ fontSize: 22 }} />,
  },
  {
    id: 'momo',
    label: 'Thanh Toán Qua MoMo',
    description: 'Quét mã QR hoặc đăng nhập ví MoMo để thanh toán nhanh.',
    badge: { text: 'MoMo', bg: '#A50064', color: '#fff' },
    icon: (
      <span className="text-[22px] font-black" style={{ color: '#A50064', fontFamily: 'monospace' }}>M</span>
    ),
  },
];

const PaymentMethodSelector = ({ selected, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[18px] font-bold text-[#1a1a1a] m-0 pb-3 border-b border-[#f0f0f0]">
        <CreditCardOutlined className='mr-1'/> Phương Thức Thanh Toán
      </h3>

      {METHODS.map((method) => {
        const isSelected = selected === method.id;
        return (
          <button
            key={method.id}
            onClick={() => onChange(method.id)}
            className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white ${
              isSelected
                ? 'border-[#1a1a1a] shadow-[0_0_0_3px_rgba(26,26,26,0.08)]'
                : 'border-[#e5e5e5] hover:border-[#bbb]'
            }`}
          >
            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isSelected ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f5f5] text-[#555]'
            } transition-colors`}>
              {method.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-bold text-[#1a1a1a]">{method.label}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: method.badge.bg, color: method.badge.color }}
                >
                  {method.badge.text}
                </span>
              </div>
              <p className="text-[12px] text-[#888] m-0 mt-0.5">{method.description}</p>
            </div>

            {/* Check */}
            {isSelected && (
              <CheckCircleFilled className="text-[25px] shrink-0 text-[#1a1a1a]" />
            )}
          </button>
        );
      })}

      {/* Security note */}
      <p className="text-[12px] text-[black] m-0 mt-2 flex items-center gap-2">
        <LockOutlined className="mb-0.5 text-[13px]"/> Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối.
      </p>
    </div>
  );
};

export default PaymentMethodSelector;
