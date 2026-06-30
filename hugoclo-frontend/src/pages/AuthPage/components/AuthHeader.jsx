// ============================================================
// AuthHeader — Minimal centered logo header
// ============================================================

import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import logo from '../../../assets/hugoclo_logo.png';

const AuthHeader = () => {
  return (
    <header className="bg-white border-b border-[#e5e5e5] h-[64px] flex items-center relative shrink-0">
      {/* Back to shop — left */}
      <div className="absolute left-0 pl-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-[13px] font-semibold text-[#555] no-underline hover:text-[#1a1a1a] transition-colors duration-200 group"
          aria-label="Quay về trang chủ"
        >
          <ArrowLeftOutlined className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Quay Về Cửa Hàng</span>
        </Link>
      </div>

      {/* Logo — center */}
      <div className="flex-1 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="HugoClo Trang Chủ">
          <img src={logo} alt="HugoClo Logo" className="h-[72px] w-full object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-[18px] font-black text-[#1a1a1a] tracking-[0.06em]">HUGOCLO</span>
            <span className="text-[9px] text-[#999] tracking-[0.12em] lowercase mt-0.5">est. 2024</span>
          </div>
        </Link>
      </div>

      {/* Spacer right (balance centering) */}
      <div className="absolute right-0 pr-6 w-[160px]" />
    </header>
  );
};

export default AuthHeader;
