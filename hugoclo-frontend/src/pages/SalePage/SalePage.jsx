// ============================================================
// SalePage — Trang Sale: chỉ hiển thị sản phẩm đang isOnSale
// Giống cấu trúc ProductsPage nhưng luôn filter isOnSale=true
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  WarningOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { Select } from 'antd';
import { AppstoreOutlined, BorderOutlined } from '@ant-design/icons';
import { fetchProducts } from '../../api/productService';
import ProductCard from '../ProductsPage/components/ProductCard';
import FilterSidebar from '../ProductsPage/components/FilterSidebar';

const PER_PAGE_OPTIONS = [12, 24, 48];

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Mới Nhất' },
  { value: 'price_asc',   label: 'Giá Tăng Dần' },
  { value: 'price_desc',  label: 'Giá Giảm Dần' },
  { value: 'best_seller', label: 'Bán Chạy' },
  { value: 'rating',      label: 'Đánh Giá Cao' },
];

const defaultFilters = {
  categories: [],
  priceRange:  [0, 2000000],
  sizes:       [],
  colors:      [],
  rating:      null,
};

// ── Pagination ──
const Pagination = ({ page, totalPages, onChange }) => {
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 13); i++) pages.push(i);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5 py-10">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e0e0e0] bg-white text-[#555] disabled:opacity-30 cursor-pointer hover:border-[#1a1a1a] transition-colors"
      >
        <LeftOutlined className="text-[12px]" />
      </button>

      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {showEllipsis && (
              <span className="w-9 h-9 flex items-center justify-center text-[#aaa] text-[13px]">…</span>
            )}
            <button
              onClick={() => onChange(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border text-[13px] font-semibold cursor-pointer transition-all ${
                p === page
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#1a1a1a]'
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e0e0e0] bg-white text-[#555] disabled:opacity-30 cursor-pointer hover:border-[#1a1a1a] transition-colors"
      >
        <RightOutlined className="text-[12px]" />
      </button>
    </div>
  );
};

// ── Skeleton card ──
const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-[#f0f0f0] animate-pulse">
    <div className="aspect-square bg-[#f0f0f0]" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-3 bg-[#f0f0f0] rounded w-1/3" />
      <div className="h-4 bg-[#f0f0f0] rounded w-3/4" />
      <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
      <div className="h-4 bg-[#f0f0f0] rounded w-1/3" />
      <div className="flex gap-2 mt-1">
        <div className="flex-1 h-9 bg-[#f0f0f0] rounded-lg" />
        <div className="flex-1 h-9 bg-[#f0f0f0] rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Normalize product ──
const normalizeProduct = (p) => ({
  ...p,
  id:            p._id,
  image:         p.images?.[0] || '',
  reviewCount:   p.reviewCount || 0,
  originalPrice: p.originalPrice || null,
});

// ── SaleSortBar ──
const SaleSortBar = ({ sortBy, onSortChange, gridCols, onGridChange, total, page, perPage }) => {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);

  return (
    <div className="sticky top-[108px] z-[99] bg-white border-b border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1320px] mx-auto px-6 py-3 flex items-center justify-end gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[#999] whitespace-nowrap hidden lg:block">
            {total} sản phẩm
          </span>

          <Select
            value={sortBy}
            onChange={onSortChange}
            options={SORT_OPTIONS}
            size="small"
            style={{ width: 180, fontSize: 14 }}
            variant="outlined"
          />

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

// ── Main SalePage ──
const SalePage = () => {
  const [filters,    setFilters]   = useState(defaultFilters);
  const [sortBy,     setSortBy]    = useState('newest');
  const [gridCols,   setGridCols]  = useState(4);
  const [page,       setPage]      = useState(1);
  const [perPage,    setPerPage]   = useState(12);

  const [products,   setProducts]  = useState([]);
  const [total,      setTotal]     = useState(0);
  const [totalPages, setTotalPages]= useState(1);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState(null);

  const buildParams = useCallback(() => {
    const params = {
      page,
      limit:    perPage,
      sort:     sortBy,
      isOnSale: true,          // ← luôn chỉ lấy sp đang sale
    };

    const CATEGORY_TO_TYPE = { 'Áo': 'tops', 'Quần': 'bottoms', 'Giày': 'shoes', 'Phụ kiện': 'accessory' };
    if (filters.categories.length > 0) {
      const types = filters.categories.map((c) => CATEGORY_TO_TYPE[c] || c).filter(Boolean);
      if (types.length > 0) params.productTypes = types.join(',');
    }
    if (filters.priceRange[0] > 0)       params.minPrice  = filters.priceRange[0];
    if (filters.priceRange[1] < 2000000) params.maxPrice  = filters.priceRange[1];
    if (filters.rating)                  params.minRating = filters.rating;
    if (filters.sizes.length > 0)        params.sizes     = filters.sizes.join(',');
    if (filters.colors.length > 0)       params.colors    = filters.colors.join(',');

    return params;
  }, [page, perPage, sortBy, filters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProducts(buildParams())
      .then((data) => {
        if (cancelled) return;
        setProducts((data.products || []).map(normalizeProduct));
        setTotal(data.totalProducts || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Không thể tải sản phẩm');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [buildParams]);

  const handleFilterChange = (partial) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">

      {/* ── Hero Sale Banner ── */}
      <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2d0a0a] to-[#1a1a1a] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-white/5" />

        <div className="max-w-[1320px] mx-auto px-6 py-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <FireOutlined className="text-[#ff6b6b] text-[28px]" />
              <span className="text-white/60 text-[13px] font-semibold uppercase tracking-[0.15em]">
                Ưu Đãi Đặc Biệt
              </span>
            </div>
            <h1 className="text-white text-[42px] md:text-[56px] font-black leading-none m-0 tracking-tight">
              FLASH SALE
            </h1>
            <p className="text-white/70 mt-2 text-[15px] m-0">
              Giảm giá lên đến <span className="text-[#ff6b6b] font-bold">70%</span> — Số lượng có hạn, nhanh tay!
            </p>
          </div>

          {/* <div className="flex gap-4">
            {[
              { num: total, label: 'Sản phẩm' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20"
              >
                <div className="text-white text-[32px] font-black leading-none">{item.num}</div>
                <div className="text-white/60 text-[12px] mt-1 font-medium">{item.label}</div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[#ebebeb]">
        <div className="max-w-[1320px] mx-auto px-6 py-3.5">
          <nav className="flex items-center gap-2 text-[14px] text-[#999]" aria-label="breadcrumb">
            <Link to="/" className="flex items-center gap-1.5 hover:text-[#1a1a1a] transition-colors no-underline text-[#999] font-medium">
              <HomeOutlined />
              <span>Trang Chủ</span>
            </Link>
            <span className="text-[#ccc]">/</span>
            <span className="font-semibold text-[#1a1a1a]">Sale</span>
          </nav>
        </div>
      </div>

      {/* ── Sort bar ── */}
      <SaleSortBar
        sortBy={sortBy}       onSortChange={(v) => { setSortBy(v); setPage(1); }}
        gridCols={gridCols}   onGridChange={setGridCols}
        total={total}
        page={page}
        perPage={perPage}
      />

      {/* ── Main content ── */}
      <div className="max-w-[1320px] mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* Left sidebar */}
          <div className="hidden lg:block sticky top-[164px] self-start">
            <div className="bg-white rounded-2xl border border-[#ebebeb] p-6 w-[220px]">
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">

            {/* Error */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <WarningOutlined style={{ fontSize: '58px', marginBottom: '16px', color: '#e63946' }} />
                <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-3">Không thể tải sản phẩm</h3>
                <button
                  onClick={() => setError(null)}
                  className="h-10 px-6 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-lg border-none cursor-pointer hover:bg-[#333]"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className={`grid gap-5 ${
                gridCols === 4
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-2 md:grid-cols-3'
              }`}>
                {Array.from({ length: perPage > 12 ? 12 : perPage }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">
                  <SearchOutlined style={{ color: '#000000ff' }} />
                </div>
                <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-2">
                  Chưa có sản phẩm sale
                </h3>
                <p className="text-[#888] mb-6">Thử thay đổi bộ lọc hoặc quay lại sau nhé!</p>
                <button
                  onClick={handleResetFilters}
                  className="h-10 px-6 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-lg border-none cursor-pointer hover:bg-[#333]"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            )}

            {/* Product grid */}
            {!loading && !error && products.length > 0 && (
              <div className={`grid gap-5 ${
                gridCols === 4
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-2 md:grid-cols-3'
              }`}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination + per page */}
            {!loading && !error && products.length > 0 && (
              <div className="mt-4 border-t border-[#ebebeb]">
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-[13px] text-[#888]">
                    <span>Hiển thị</span>
                    {PER_PAGE_OPTIONS.map((n) => (
                      <button
                        key={n}
                        onClick={() => { setPerPage(n); setPage(1); }}
                        className={`w-8 h-8 text-[12px] font-semibold rounded-lg border cursor-pointer transition-colors ${
                          perPage === n
                            ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                            : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#1a1a1a]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span>/ trang</span>
                  </div>

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SalePage;

