// ============================================================
// AuthFooter — Minimal copyright footer
// ============================================================

import React from 'react';

const AuthFooter = () => {
  return (
    <footer className="bg-white border-t border-[#e5e5e5] py-4 shrink-0">
      <div className="container-custom flex items-center justify-between flex-wrap gap-3 text-[12px] text-[#999]">
        <p className="m-0">© {new Date().getFullYear()} HugoClo. Bảo lưu mọi quyền.</p>
        <div className="flex gap-5">
          {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Hỗ trợ khách hàng'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[#999] hover:text-[#1a1a1a] no-underline transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;
