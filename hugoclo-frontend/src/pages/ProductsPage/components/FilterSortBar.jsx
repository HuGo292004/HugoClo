// ============================================================
// FilterSortBar — Sort dropdown + grid-view toggle
// ============================================================

import React from 'react';
import { Select } from 'antd';
import { AppstoreOutlined, BorderOutlined } from '@ant-design/icons';

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Mới Nhất' },
  { value: 'price_asc',   label: 'Giá Tăng Dần' },
  { value: 'price_desc',  label: 'Giá Giảm Dần' },
  { value: 'best_seller', label: 'Bán Chạy' },
  { value: 'rating',      label: 'Đánh Giá Cao' },
];

const FilterSortBar = ({
  sortBy, onSortChange,
  gridCols, onGridChange,
  total, page, perPage,
}) => {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);

  return (
    <div className="sticky top-[108px] z-[99] bg-white border-b border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1320px] mx-auto px-6 py-3 flex items-center justify-end gap-4">

        <div className="flex items-center gap-3">
          {/* Result count */}
          <span className="text-[14px] text-[#999] whitespace-nowrap hidden lg:block">
            {start}–{end} / {total} sản phẩm
          </span>

          {/* Sort dropdown */}
          <Select
            value={sortBy}
            onChange={onSortChange}
            options={SORT_OPTIONS}
            size="small"
            style={{ width: 180, fontSize: 14 }}
            variant="outlined"
          />

          {/* Grid toggle */}
          <div className="flex items-center border border-[#e0e0e0] rounded-lg overflow-hidden">
            <button
              onClick={() => onGridChange(4)}
              className={`w-8 h-8 flex items-center justify-center text-[16px] border-none cursor-pointer transition-colors ${
                gridCols === 4 ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#888] hover:bg-[#f5f5f5]'
              }`}
              title="4 cột"
            >
              <AppstoreOutlined />
            </button>
            <button
              onClick={() => onGridChange(3)}
              className={`w-8 h-8 flex items-center justify-center text-[16px] border-none cursor-pointer transition-colors border-l border-[#e0e0e0] ${
                gridCols === 3 ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#888] hover:bg-[#f5f5f5]'
              }`}
              title="3 cột"
            >
              <BorderOutlined />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSortBar;
