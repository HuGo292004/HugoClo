// ============================================================
// CategorySection — 4 category cards (Tailwind CSS)
// ============================================================

import React from 'react';
import { CATEGORIES } from '../../../data/products';

const CategorySection = () => {
  return (
    <section className="bg-white section-py" id="categories" aria-label="Danh mục sản phẩm">
      <div className="container-custom">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-bold text-primary tracking-[-0.02em] mb-3">
            Mua Theo Danh Mục
          </h2>
          <p className="text-[16px] text-[#888]">Tìm phong cách của bạn từ bộ sưu tập đa dạng</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.key}`}
              className="group relative block rounded-lg overflow-hidden cursor-pointer no-underline bg-[#f0f0f0] aspect-[3/4] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
              aria-label={`Xem danh mục ${cat.label}`}
            >
              {/* Sale ribbon */}
              {cat.isSale && (
                <div className="absolute top-5 -right-7 z-20 rotate-45 w-[110px] bg-[#d4af37] text-primary text-[10px] font-black tracking-[0.12em] text-center py-1.5">
                  SALE
                </div>
              )}

              {/* Image */}
              <div className="absolute inset-0">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-black/4 group-hover:opacity-90 transition-opacity duration-300" />
              </div>

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between z-10">
                <span className="text-[18px] font-bold text-white uppercase tracking-[0.06em]">
                  {cat.label}
                </span>
                <span className="text-[20px] text-white opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  →
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategorySection;
