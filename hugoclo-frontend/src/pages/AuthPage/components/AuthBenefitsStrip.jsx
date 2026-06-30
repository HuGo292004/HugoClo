// ============================================================
// AuthBenefitsStrip — 3 trust icons below auth card
// ============================================================

import { LockOutlined, RetweetOutlined, TruckOutlined } from '@ant-design/icons';
import React from 'react';

const PERKS = [
  { icon: <TruckOutlined />, label: 'Miễn Phí Vận Chuyển', sub: 'Đơn từ 500K' },
  { icon: <RetweetOutlined />, label: 'Đổi Trả 30 Ngày',     sub: 'Không cần lý do' },
  { icon: <LockOutlined />, label: 'Thanh Toán An Toàn',   sub: 'Mã hóa SSL 256-bit' },
];

const AuthBenefitsStrip = () => {
  return (
    <div className="mt-8 w-full max-w-[480px]">
      <div className="grid grid-cols-3 gap-3">
        {PERKS.map(({ icon, label, sub }) => (
          <div
            key={label}
            className="bg-white rounded-xl px-3 py-4 flex flex-col items-center text-center gap-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow duration-250"
          >
            <span className="text-[22px]" role="img" aria-hidden="true">{icon}</span>
            <span className="text-[12px] font-bold text-[#1a1a1a] leading-tight">{label}</span>
            <span className="text-[11px] text-[#999]">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthBenefitsStrip;
