// ============================================================
// Footer — 4-column dark footer (Tailwind CSS)
// ============================================================

import React from 'react';
import {
  FacebookFilled,
  InstagramFilled,
  YoutubeFilled,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import logo from '../../../assets/hugoclo_logo.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-white font-['Inter']" role="contentinfo">

      {/* ── Main Section ── */}
      <div className="py-18 pb-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">

            {/* Col 1 — Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img
                  src={logo}
                  alt="HugoClo Logo"
                  className="h-9 w-auto object-contain brightness-0 invert opacity-90"
                />
                <span className="text-[18px] font-black tracking-[0.08em]">HUGOCLO</span>
              </div>
              <p className="text-sm text-white/60 leading-7 mb-5 max-w-[280px]">
                Thương hiệu thời trang tối giản Việt Nam. Chúng tôi tin rằng phong cách đẹp không cần phải phức tạp.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: <EnvironmentOutlined />, text: '123 Đường Lê Lợi, Q.1, TP.HCM' },
                  { icon: <PhoneOutlined />,       text: '1800 6868' },
                  { icon: <MailOutlined />,        text: 'hello@hugoclo.vn' },
                ].map(({ icon, text }) => (
                  <span key={text} className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white/90 transition-colors">
                    {icon} {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Col 2 — Customer Service */}
            <div>
              <FooterColTitle>Dịch Vụ Khách Hàng</FooterColTitle>
              <FooterLinks links={[
                'Hướng dẫn mua hàng',
                'Tra cứu đơn hàng',
                'Chính sách vận chuyển',
                'Đổi trả & hoàn tiền',
                'Hỗ trợ trực tuyến',
                'Câu hỏi thường gặp',
              ]} />
            </div>

            {/* Col 3 — Policies */}
            <div>
              <FooterColTitle>Chính Sách</FooterColTitle>
              <FooterLinks links={[
                'Chính sách bảo mật',
                'Điều khoản sử dụng',
                'Chính sách cookie',
                'Bảo hành sản phẩm',
                'Quy định thành viên',
                'Về chúng tôi',
              ]} />
            </div>

            {/* Col 4 — Social */}
            <div>
              <FooterColTitle>Theo Dõi Chúng Tôi</FooterColTitle>

              <div className="flex gap-3 mb-6">
                {[
                  { icon: <FacebookFilled />,  label: 'Facebook' },
                  { icon: <InstagramFilled />, label: 'Instagram' },
                  { icon: <YoutubeFilled />,   label: 'YouTube' },
                ].map(({ icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[18px] text-white/80 no-underline transition-all duration-250 hover:bg-white hover:text-primary hover:-translate-y-0.5"
                  >
                    {icon}
                  </a>
                ))}
              </div>

              <p className="text-[12px] text-white/50 uppercase tracking-[0.08em] mb-3">Tải ứng dụng HugoClo</p>
              <div className="flex gap-2 flex-wrap">
                {['App Store', 'Google Play'].map((name) => (
                  <button
                    key={name}
                    className="bg-white/10 border border-white/20 text-white/80 rounded-md px-3.5 py-1.5 text-[12px] font-semibold font-['Inter'] cursor-pointer transition-all duration-200 hover:bg-white/20 hover:text-white"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10 py-5">
        <div className="container-custom flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-white/40 m-0">
            © {new Date().getFullYear()} HugoClo. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-2 flex-wrap items-center">
            {['MoMo', 'VNPay'].map((name) => (
              <span
                key={name}
                className="bg-white/8 border border-white/15 text-white/60 rounded px-2.5 py-1 text-[11px] font-bold tracking-[0.06em]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

/* ── Sub-components ── */
const FooterColTitle = ({ children }) => (
  <h3 className="text-[12px] font-bold tracking-[0.12em] uppercase text-white mb-5 pb-2.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-7 after:h-0.5 after:bg-white/40 after:rounded">
    {children}
  </h3>
);

const FooterLinks = ({ links }) => (
  <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
    {links.map((link) => (
      <li key={link}>
        <a
          href="#"
          className="text-[13px] text-white/60 no-underline transition-all duration-200 hover:text-white hover:pl-1 block"
        >
          {link}
        </a>
      </li>
    ))}
  </ul>
);

export default Footer;
