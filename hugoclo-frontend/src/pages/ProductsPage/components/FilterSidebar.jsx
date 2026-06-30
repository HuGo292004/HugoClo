// ============================================================
// FilterSidebar — Category, Price, Size, Color, Rating filters
// ============================================================

import React from 'react';
import { Slider, Checkbox } from 'antd';
import { formatPrice } from '../../../data/products';

/* ── Size chip button ── */
const SizeBtn = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 text-[12px] font-semibold rounded-lg border cursor-pointer transition-all duration-150 ${
      selected
        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
        : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#1a1a1a]'
    }`}
  >
    {label}
  </button>
);

/* ── Color swatch ── */
const ColorSwatch = ({ color, hex, selected, onClick }) => (
  <button
    onClick={onClick}
    title={color}
    className="relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-150 flex items-center justify-center"
    style={{
      backgroundColor: hex,
      borderColor: selected ? '#1a1a1a' : 'transparent',
      boxShadow: selected ? '0 0 0 2px white, 0 0 0 3px #1a1a1a' : 'inset 0 0 0 1px rgba(0,0,0,0.12)',
    }}
  >
    {selected && (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={hex === '#ffffff' ? '#1a1a1a' : 'white'} strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </button>
);

/* ── Section wrapper ── */
const Section = ({ title, children }) => (
  <div className="border-b border-[#f0f0f0] pb-5 mb-5 last:border-none last:mb-0 last:pb-0">
    <p className="text-[11px] font-bold text-[#888] uppercase tracking-[0.12em] mb-3 m-0">{title}</p>
    {children}
  </div>
);

/* ── Star radio ── */
const StarRadio = ({ stars, label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 w-full py-1.5 text-left bg-transparent border-none cursor-pointer rounded-md px-2 transition-colors ${
      selected ? 'bg-[#f5f5f5]' : 'hover:bg-[#fafafa]'
    }`}
  >
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= stars ? 'text-[#f59e0b]' : 'text-[#e5e5e5]'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="text-[13px] text-[#555]">{label}</span>
    {selected && (
      <span className="ml-auto w-2 h-2 rounded-full bg-[#1a1a1a]" />
    )}
  </button>
);

const COLORS = [
  { color: 'Đen',     hex: '#1a1a1a' },
  { color: 'Trắng',   hex: '#ffffff' },
  { color: 'Be',      hex: '#d4b896' },
  { color: 'Xanh Navy', hex: '#1e3a5f' },
  { color: 'Xám',     hex: '#9ca3af' },
  { color: 'Hồng Đất', hex: '#c47a5a' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const FilterSidebar = ({ filters, onChange, onReset }) => {
  const { categories, priceRange, sizes, colors, rating } = filters;

  const toggleCategory = (cat) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    onChange({ categories: next });
  };

  const toggleSize = (size) => {
    const next = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    onChange({ sizes: next });
  };

  const toggleColor = (color) => {
    const next = colors.includes(color)
      ? colors.filter((c) => c !== color)
      : [...colors, color];
    onChange({ colors: next });
  };

  return (
    <aside className="w-[180px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5  ">
        <h2 className="text-[15px] font-bold text-[#1a1a1a] uppercase tracking-[0.1em] m-0">
          Bộ Lọc
        </h2>
        <button
          onClick={onReset}
          className="text-[12px] text-[#888] underline bg-transparent border-none cursor-pointer hover:text-[#1a1a1a] p-0"
        >
          Xóa Tất Cả
        </button>
      </div>

      {/* Danh Mục */}
      <Section title="Danh Mục">
        <div className="flex flex-col gap-2">
          {[
            { key: 'men',    label: 'Nam' },
            { key: 'women',  label: 'Nữ' },
            { key: 'unisex', label: 'Unisex' },
          ].map(({ key, label }) => (
            <Checkbox
              key={key}
              checked={categories.includes(key)}
              onChange={() => toggleCategory(key)}
              className="text-[13px] text-[#444]"
            >
              {label}
            </Checkbox>
          ))}
        </div>
      </Section>

      {/* Giá */}
      <Section title="Khoảng Giá">
        <Slider
          range
          min={0}
          max={2000000}
          step={50000}
          value={priceRange}
          onChange={(val) => onChange({ priceRange: val })}
          styles={{ track: { backgroundColor: '#1a1a1a' }, handle: { borderColor: '#1a1a1a' } }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[12px] text-[#888]">{formatPrice(priceRange[0])}</span>
          <span className="text-[12px] text-[#888]">{formatPrice(priceRange[1])}</span>
        </div>
      </Section>

      {/* Size */}
      <Section title="Kích Thước">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <SizeBtn
              key={s}
              label={s}
              selected={sizes.includes(s)}
              onClick={() => toggleSize(s)}
            />
          ))}
        </div>
      </Section>

      {/* Màu Sắc */}
      <Section title="Màu Sắc">
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map(({ color, hex }) => (
            <ColorSwatch
              key={color}
              color={color}
              hex={hex}
              selected={colors.includes(color)}
              onClick={() => toggleColor(color)}
            />
          ))}
        </div>
      </Section>

      {/* Đánh Giá */}
      <Section title="Đánh Giá">
        <div className="flex flex-col gap-0.5">
          {[
            { stars: 5, label: '5 Sao' },
            { stars: 4, label: '4 Sao trở lên' },
            { stars: 3, label: '3 Sao trở lên' },
          ].map(({ stars, label }) => (
            <StarRadio
              key={stars}
              stars={stars}
              label={label}
              selected={rating === stars}
              onClick={() => onChange({ rating: rating === stars ? null : stars })}
            />
          ))}
        </div>
      </Section>
    </aside>
  );
};

export default FilterSidebar;
