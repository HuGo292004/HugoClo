// ============================================================
// GenderedProductsPage — Trang sản phẩm lọc theo giới tính
// Dùng chung cho Nam (/men) và Nữ (/women)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HomeOutlined, LeftOutlined, RightOutlined,
  SearchOutlined, WarningOutlined,
} from '@ant-design/icons';
import { fetchProducts } from '../../api/productService';
import ProductCard         from './components/ProductCard';
import FilterSidebar       from './components/FilterSidebar';
import GenderFilterSortBar from './components/GenderFilterSortBar';

const PER_PAGE_OPTIONS = [12, 24, 48];

// ── Default filter state (không có categories vì gender đã fix) ──
const defaultFilters = {
  priceRange: [0, 2000000],
  sizes:      [],
  colors:     [],
  rating:     null,
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

// ── Config theo giới tính ──
const GENDER_CONFIG = {
  men: {
    gender:      'men',
    title:       'Thời Trang Nam',
    breadcrumb:  'Thời Trang Nam',
    accentColor: '#000000ff',
  },
  women: {
    gender:      'women',
    title:       'Thời Trang Nữ',
    breadcrumb:  'Thời Trang Nữ',
    accentColor: '#000000ff',
  },
};

// ── Main component ──
const GenderedProductsPage = ({ genderKey }) => {
  const config = GENDER_CONFIG[genderKey];

  const [filters,     setFilters]    = useState(defaultFilters);
  const [quickFilter, setQuickFilter]= useState('all');
  const [sortBy,      setSortBy]     = useState('newest');
  const [gridCols,    setGridCols]   = useState(4);
  const [page,        setPage]       = useState(1);
  const [perPage,     setPerPage]    = useState(12);

  const [products,   setProducts]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const buildParams = useCallback(() => {
    const params = {
      page,
      limit:    perPage,
      sort:     sortBy,
      category: config.gender, // luon filter theo gioi tinh
    };

    if (quickFilter === 'sale')      params.isOnSale    = true;
    if (quickFilter === 'tops')      params.productType = 'tops';
    if (quickFilter === 'bottoms')   params.productType = 'bottoms';
    if (quickFilter === 'shoes')     params.productType = 'shoes';
    if (quickFilter === 'accessory') params.productType = 'accessory';

    if (filters.priceRange[0] > 0)       params.minPrice  = filters.priceRange[0];
    if (filters.priceRange[1] < 2000000) params.maxPrice  = filters.priceRange[1];
    if (filters.rating)                  params.minRating = filters.rating;
    if (filters.sizes.length > 0)        params.sizes     = filters.sizes.join(',');
    if (filters.colors.length > 0)       params.colors    = filters.colors.join(',');

    return params;
  }, [page, perPage, sortBy, quickFilter, filters, config.gender]);

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

  // Reset page khi đổi gender
  useEffect(() => {
    setPage(1);
    setFilters(defaultFilters);
    setQuickFilter('all');
  }, [genderKey]);

  const handleFilterChange = (partial) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setQuickFilter('all');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">

      {/* ── Breadcrumb bar ── */}
      <div className="bg-white border-b border-[#ebebeb]">
        <div className="max-w-[1320px] mx-auto px-6 py-3.5">
          <nav className="flex items-center gap-2 text-[14px] text-[#999]" aria-label="breadcrumb">
            <Link to="/" className="flex items-center gap-1.5 hover:text-[#1a1a1a] transition-colors no-underline text-[#999] font-medium">
              <HomeOutlined />
              <span>Trang Chủ</span>
            </Link>
            <span className="text-[#ccc]">/</span>
            <span className="font-semibold text-[#1a1a1a]">{config.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* ── Filter + Sort bar ── */}
      <GenderFilterSortBar
        activeQuick={quickFilter}
        onQuickChange={(k) => { setQuickFilter(k); setPage(1); }}
        sortBy={sortBy}
        onSortChange={(v) => { setSortBy(v); setPage(1); }}
        gridCols={gridCols}
        onGridChange={setGridCols}
        total={total}
        page={page}
        perPage={perPage}
        accentColor={config.accentColor}
      />

      {/* ── Main content ── */}
      <div className="max-w-[1320px] mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* Sidebar */}
          <div className="hidden lg:block sticky top-[164px] self-start">
            <div className="bg-white rounded-2xl border border-[#ebebeb] p-6 w-[220px]">
              <FilterSidebar
                filters={{ ...filters, categories: [] }}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                hideCategoryFilter
              />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">

            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <WarningOutlined style={{ fontSize: '58px', marginBottom: '16px', color: '#ccc' }} />
                <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-3">Không thể tải sản phẩm</h3>
                <button
                  onClick={() => setError(null)}
                  className="h-10 px-6 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-lg border-none cursor-pointer hover:bg-[#333]"
                >
                  Thử lại
                </button>
              </div>
            )}

            {loading && (
              <div className={`grid gap-5 ${
                gridCols === 4 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'
              }`}>
                {Array.from({ length: perPage > 12 ? 12 : perPage }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4 text-[#ddd]"><SearchOutlined /></div>
                <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-[#888] mb-6">Thử thay đổi bộ lọc để xem thêm sản phẩm</p>
                <button
                  onClick={handleResetFilters}
                  className="h-10 px-6 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-lg border-none cursor-pointer hover:bg-[#333]"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className={`grid gap-5 ${
                gridCols === 4 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'
              }`}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

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
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderedProductsPage;
