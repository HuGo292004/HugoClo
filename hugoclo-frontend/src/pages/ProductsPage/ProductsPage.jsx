// ============================================================
// ProductsPage — Banner + Sidebar Filters + Product Grid + Pagination
// (Kết nối API thực thay vì dữ liệu tĩnh)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HomeOutlined, LeftOutlined, RightOutlined, SearchOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { fetchProducts } from '../../api/productService';
import ProductCard   from './components/ProductCard';
import FilterSidebar from './components/FilterSidebar';
import FilterSortBar from './components/FilterSortBar';

const PER_PAGE_OPTIONS = [12, 24, 48];

// ── Default filter state ──
const defaultFilters = {
  categories: [],
  priceRange:  [0, 2000000],
  sizes:       [],
  colors:      [],
  rating:      null,
};

// ── Pagination component ──
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

// ── Normalize product từ API để khớp ProductCard ──────────────
const normalizeProduct = (p) => ({
  ...p,
  id:            p._id,
  image:         p.images?.[0] || '',
  reviewCount:   p.reviewCount || 0,
  originalPrice: p.originalPrice || null,
});

// ── Main page ──
const ProductsPage = () => {
  const [filters,     setFilters]    = useState(defaultFilters);
  const [quickFilter, setQuickFilter]= useState('all');
  const [sortBy,      setSortBy]     = useState('newest');
  const [gridCols,    setGridCols]   = useState(4);
  const [page,        setPage]       = useState(1);
  const [perPage,     setPerPage]    = useState(12);

  // API state
  const [products,    setProducts]   = useState([]);
  const [total,       setTotal]      = useState(0);
  const [totalPages,  setTotalPages] = useState(1);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState(null);

  // Build query params từ filters + sort + page
  const buildParams = useCallback(() => {
    const params = {
      page,
      limit: perPage,
      sort:  sortBy,
    };

    // Quick filter
    if (quickFilter === 'sale')      params.isOnSale     = true;
    if (quickFilter === 'men')       params.category     = 'men';
    if (quickFilter === 'women')     params.category     = 'women';
    if (quickFilter === 'tops')      params.productType  = 'tops';
    if (quickFilter === 'bottoms')   params.productType  = 'bottoms';
    if (quickFilter === 'shoes')     params.productType  = 'shoes';
    if (quickFilter === 'accessory') params.productType  = 'accessory';

    // Sidebar filters
    // Danh mục (gender) — hỗ trợ nhiều lựa chọn
    if (filters.categories.length > 0) params.genders = filters.categories.join(',');
    if (filters.priceRange[0] > 0)       params.minPrice  = filters.priceRange[0];
    if (filters.priceRange[1] < 2000000) params.maxPrice  = filters.priceRange[1];
    if (filters.rating)                  params.minRating  = filters.rating;
    // Kích thước — hỗ trợ nhiều lựa chọn
    if (filters.sizes.length > 0)        params.sizes      = filters.sizes.join(',');
    // Màu sắc — gửi hex codes
    if (filters.colors.length > 0)       params.colors     = filters.colors.join(',');

    return params;
  }, [page, perPage, sortBy, quickFilter, filters]);

  // Fetch khi params thay đổi
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
    setQuickFilter('all');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">

      {/* ── Page Banner ── */}
      <div className="bg-white border-b border-[#ebebeb]">
        <div className="max-w-[1320px] mx-auto px-6 py-10">
          <nav className="flex items-center gap-2 text-[12px] text-[#999] mb-4" aria-label="breadcrumb">
            <Link to="/" className="flex items-center gap-1 hover:text-[#1a1a1a] transition-colors no-underline text-[#999]">
              <HomeOutlined />
              <span>Trang Chủ</span>
            </Link>
            <span className="text-[#ccc]">/</span>
            <span className="text-[#1a1a1a] font-medium">Tất Cả Sản Phẩm</span>
          </nav>

          <h1 className="text-[42px] font-black text-[#1a1a1a] tracking-[-0.02em] m-0 leading-none font-['Inter']">
            Tất Cả Sản Phẩm
          </h1>
          <p className="text-[16px] text-[#888] mt-3 m-0">
            Khám phá <span className="font-semibold text-[#1a1a1a]">{loading ? '...' : total}</span> sản phẩm thời trang chất lượng cao
          </p>
        </div>
      </div>

      {/* ── Filter + Sort sticky bar ── */}
      <FilterSortBar
        activeQuick={quickFilter}   onQuickChange={(k) => { setQuickFilter(k); setPage(1); }}
        sortBy={sortBy}             onSortChange={(v) => { setSortBy(v); setPage(1); }}
        gridCols={gridCols}         onGridChange={setGridCols}
        total={total}
        page={page}
        perPage={perPage}
      />

      {/* ── Main content area ── */}
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

            {/* Error state */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <WarningOutlined style={{ fontSize: '58px', marginBottom: '16px' }} />
                <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-3">Không tìm thấy sản phẩm</h3>
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
                <div className="text-6xl mb-4"><SearchOutlined /></div>
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

            {/* Pagination */}
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

export default ProductsPage;
