// ============================================================
// TopBar — Announcement banner (Tailwind CSS)
// ============================================================

import { LockOutlined, RetweetOutlined, TruckOutlined } from '@ant-design/icons';
import React from 'react';

const TopBar = () => {
  return (
    <div className="bg-primary text-white h-9 flex items-center justify-center text-[11px] font-medium tracking-[0.08em] uppercase z-[1001] overflow-hidden">
      <div className="flex items-center gap-4 flex-nowrap overflow-hidden">
        <span className="whitespace-nowrap opacity-90 hover:opacity-100 transition-opacity">
          <TruckOutlined className="text-[14px] " /> MIỄN PHÍ VẬN CHUYỂN cho đơn hàng trên 500K
        </span>
        <span className="text-white/30 shrink-0">|</span>
        <span className="whitespace-nowrap opacity-90 hover:opacity-100 transition-opacity">
          <RetweetOutlined className="text-[14px] " /> ĐỔI TRẢ DỄ DÀNG trong 30 ngày
        </span>
        <span className="text-white/30 shrink-0">|</span>
        <span className="whitespace-nowrap opacity-90 hover:opacity-100 transition-opacity">
          <LockOutlined className="text-[14px] " /> THANH TOÁN AN TOÀN 100%  
        </span>
      </div>
    </div>
  );
};

export default TopBar;
