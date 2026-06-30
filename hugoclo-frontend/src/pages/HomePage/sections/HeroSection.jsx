// ============================================================
// HeroSection — Full-width hero (Tailwind CSS)
// ============================================================

import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import heroImg from '../../../assets/hero_woman.png';

const HeroSection = () => {
  return (
    <section
      className="flex min-h-[90vh] overflow-hidden"
      aria-label="Trang chủ - Banner chính"
      id="hero"
    >
      {/* ── Left ── */}
      <div className="flex-[0_0_50%] bg-[#f8f8f8] flex items-center px-16 py-20">
        <div className="max-w-[520px] animate-fade-in-up">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#555] mb-6">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 inline-block" />
            Bộ Sưu Tập Mới 2024
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(48px,6vw,72px)] font-black text-primary leading-[1.0] tracking-[-0.04em] mb-6">
            Fashion<br />
            <span className="text-stroke">Made</span><br />
            Simple
          </h1>

          {/* Subtext */}
          <p className="text-[17px] text-[#666] leading-7 mb-9 font-normal max-w-[420px]">
            Khám phá bộ sưu tập thời trang tối giản, chất lượng cao cho cuộc sống hiện đại.
            Phong cách không phải là sự phức tạp.
          </p>

          {/* CTAs */}
          <div className="flex gap-3.5 flex-wrap mb-12">
            <a
              href="#featured"
              className="inline-flex items-center gap-2 h-[52px] px-7 bg-primary text-white text-[14px] font-bold rounded tracking-[0.04em] border-2 border-primary transition-all duration-250 hover:bg-[#333] hover:border-[#333] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] no-underline"
            >
              Mua Ngay <ArrowRightOutlined />
            </a>
            <a
              href="#categories"
              className="inline-flex items-center h-[52px] px-7 bg-transparent text-primary text-[14px] font-bold rounded tracking-[0.04em] border-2 border-primary transition-all duration-250 hover:bg-primary hover:text-white hover:-translate-y-px no-underline"
            >
              Khám Phá Bộ Sưu Tập
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <StatItem number="10K+" label="Khách hàng hài lòng" />
            <div className="w-px h-9 bg-[#d5d5d5] shrink-0" />
            <StatItem number="500+" label="Sản phẩm độc quyền" />
            <div className="w-px h-9 bg-[#d5d5d5] shrink-0" />
            <StatItem number="4.9★" label="Đánh giá trung bình" />
          </div>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex-[0_0_50%] bg-white relative overflow-hidden group">
        <div className="w-full h-full relative">
          <img
            src={heroImg}
            alt="Người phụ nữ mặc trang phục tối giản HugoClo"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
          />

          {/* Floating badge */}
          <div className="absolute bottom-10 left-5 bg-primary text-white px-[22px] py-3.5 rounded-lg flex flex-col gap-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] animate-fade-in-up-delay">
            <span className="text-[10px] uppercase tracking-[0.1em] opacity-70">Bộ Sưu Tập</span>
            <span className="text-[20px] font-black tracking-[0.04em]">SS 2024</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ number, label }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[22px] font-black text-primary tracking-[-0.02em]">{number}</span>
    <span className="text-[11px] text-[#888] uppercase tracking-[0.06em]">{label}</span>
  </div>
);

export default HeroSection;
