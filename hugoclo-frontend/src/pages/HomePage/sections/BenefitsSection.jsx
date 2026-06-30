// ============================================================
// BenefitsSection — 3 trust cards (Tailwind CSS)
// ============================================================

import { LockOutlined, RetweetOutlined, TruckOutlined } from '@ant-design/icons';
import React from 'react';

const BENEFITS = [
  {
    id: 1,
    icon: <TruckOutlined/>,
    highlight: 'Đơn từ 500K',
    title: 'Miễn Phí Vận Chuyển',
    desc: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500K. Giao hàng nhanh trong 2–4 ngày làm việc.',
  },
  {
    id: 2,
    icon: <RetweetOutlined/>,
    highlight: '30 ngày đổi trả',
    title: 'Đổi Trả Dễ Dàng',
    desc: 'Không hài lòng? Đổi trả miễn phí trong 30 ngày kể từ ngày nhận hàng, không cần lý do.',
  },
  {
    id: 3,
    icon: <LockOutlined />,
    highlight: 'Bảo mật 100%',
    title: 'Thanh Toán An Toàn',
    desc: 'Tất cả giao dịch được mã hóa SSL 256-bit. Chấp nhận VISA, MasterCard, MoMo, ZaloPay, VNPay.',
  },
];

const BenefitsSection = () => {
  return (
    <section className="bg-[#f7f7f7] section-py" aria-label="Quyền lợi khách hàng">
      <div className="container-custom">

        {/* Grid separated by 2px lines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-[#e5e5e5] rounded-xl overflow-hidden">
          {BENEFITS.map(({ id, icon, highlight, title, desc }) => (
            <div
              key={id}
              className="group bg-white px-10 py-12 flex flex-col gap-4 transition-colors duration-250 hover:bg-[#fafafa]"
            >
              {/* Icon box */}
              <div className="w-16 h-16 rounded-2xl bg-[#f0f0f0] flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:rotate-[-4deg] group-hover:scale-[1.05]">
                <span
                  className="text-[28px] leading-none transition-all duration-300 group-hover:[filter:brightness(0)_invert(1)]"
                  role="img"
                  aria-hidden="true"
                >
                  {icon}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#d4af37]">
                  {highlight}
                </span>
                <h3 className="text-[18px] font-bold text-primary m-0 leading-[1.3]">{title}</h3>
                <p className="text-[14px] text-[#777] leading-7 m-0">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BenefitsSection;
