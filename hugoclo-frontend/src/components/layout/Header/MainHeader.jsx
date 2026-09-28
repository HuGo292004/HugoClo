// ============================================================
// MainHeader — Logo, Nav, Search, Cart, Auth (Tailwind CSS)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, Drawer, Dropdown, message } from 'antd';
import { fetchProducts } from '../../../api/productService';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  HeartOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import logo from '../../../assets/hugoclo_logo.png';

const NAV_ITEMS = [
  { key: 'products',   label: 'Sản Phẩm',   navigate: '/products' },
  { key: 'men',        label: 'Nam',         navigate: '/men' },
  { key: 'women',      label: 'Nữ',          navigate: '/women' },
  { key: 'collection', label: 'Bộ Sưu Tập' },
  { key: 'sale',       label: 'Sale', highlight: true },
];

const MainHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);

  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount }                = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success('Đã đăng xuất thành công!');
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'info',
      label: (
        <div className="px-1 py-0.5">
          <p className="text-[13px] font-semibold text-[#1a1a1a] m-0">{user?.fullName}</p>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Đơn hàng của tôi',
      onClick: () => navigate('/my-orders'),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Tài khoản của tôi',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`bg-white border-b border-[#e5e5e5] h-[72px] flex items-center relative z-[999] transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : ''
      }`}
    >
      <div className="container-custom w-full flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 no-underline" aria-label="HugoClo Trang Chủ">
          <img src={logo} alt="HugoClo Logo" className="h-[72px] w-full object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black text-primary tracking-[0.06em] font-['Inter']">HUGOCLO</span>
            <span className="text-[10px] text-[#999] tracking-[0.12em] lowercase mt-0.5">est. 2026</span>
          </div>
        </a>

        {/* ── Desktop Navigation ── */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) =>
            item.navigate ? (
              <Link
                key={item.key}
                to={item.navigate}
                className={`group text-[13px] font-semibold uppercase tracking-[0.1em] no-underline pb-1 relative transition-colors duration-200 ${
                  item.highlight ? 'text-[#e63946]' : 'text-primary'
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-300 ${
                    item.highlight ? 'bg-[#e63946]' : 'bg-primary'
                  }`}
                />
              </Link>
            ) : (
              <a
                key={item.key}
                href={`#${item.key}`}
                className={`group text-[13px] font-semibold uppercase tracking-[0.1em] no-underline pb-1 relative transition-colors duration-200 ${
                  item.highlight ? 'text-[#e63946]' : 'text-primary'
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-300 ${
                    item.highlight ? 'bg-[#e63946]' : 'bg-primary'
                  }`}
                />
              </a>
            )
          )}
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Search */}
          <SearchBar navigate={navigate} />

          {/* Wishlist */}
          <IconBtn aria="Danh sách yêu thích">
            <HeartOutlined />
          </IconBtn>

          {/* Cart */}
          <Link to="/cart" className="no-underline">
            <IconBtn aria="Giỏ hàng">
              <Badge count={isLoggedIn ? cartCount : 0} size="small" color="#1a1a1a" offset={[2, -2]}>
                <ShoppingCartOutlined className="text-[18px]" />
              </Badge>
            </IconBtn>
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <button
                className="hidden md:flex items-center gap-2 h-[38px] px-3 rounded-full border border-[#e5e5e5] bg-transparent cursor-pointer transition-all duration-200 hover:border-[#1a1a1a] hover:shadow-sm"
                aria-label="Tài khoản của tôi"
              >
                {/* Avatar vòng tròn */}
                <span className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[12px] font-bold shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    (user?.fullName || user?.email || 'U').charAt(0).toUpperCase()
                  )}
                </span>
                <span className="text-[13px] font-semibold text-[#1a1a1a] max-w-[100px] truncate">
                  {user?.fullName || user?.email}
                </span>
              </button>
            </Dropdown>
          ) : (
            <Link
              to="/auth"
              className="hidden md:flex items-center gap-1.5 h-[38px] px-[18px] border-[1.5px] border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-semibold rounded-full bg-transparent no-underline transition-all duration-200 hover:bg-[#1a1a1a] hover:text-white"
              aria-label="Đăng nhập hoặc Đăng ký"
            >
              <UserOutlined />
              <span>Đăng Nhập</span>
            </Link>
          )}

          {/* Mobile toggle */}
          <IconBtn
            onClick={() => setMobileMenuOpen(true)}
            aria="Mở menu"
            className="flex md:hidden"
          >
            <MenuOutlined />
          </IconBtn>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <img src={logo} alt="HugoClo" className="h-8" />
            <span className="font-bold text-lg">HUGOCLO</span>
          </div>
        }
        placement="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={280}
      >
        <nav className="flex flex-col py-2">
          {NAV_ITEMS.map((item) =>
            item.navigate ? (
              <Link
                key={item.key}
                to={item.navigate}
                className={`block py-3.5 text-[15px] font-semibold uppercase tracking-[0.08em] border-b border-[#f0f0f0] no-underline transition-colors duration-200 hover:text-[#555] ${
                  item.highlight ? 'text-[#e63946]' : 'text-primary'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.key}
                href={`#${item.key}`}
                className={`block py-3.5 text-[15px] font-semibold uppercase tracking-[0.08em] border-b border-[#f0f0f0] no-underline transition-colors duration-200 hover:text-[#555] ${
                  item.highlight ? 'text-[#e63946]' : 'text-primary'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            )
          )}
          <div className="h-4" />
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 py-3 border-b border-[#f0f0f0]">
                <span className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[13px] font-bold overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    (user?.fullName || user?.email || 'U').charAt(0).toUpperCase()
                  )}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-[#1a1a1a] m-0">{user?.fullName || 'Tài khoản'}</p>
                  <p className="text-[12px] text-[#888] m-0 truncate max-w-[180px]">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full py-3.5 text-[15px] font-semibold text-[#e63946] bg-transparent border-none cursor-pointer p-0 tracking-[0.04em]"
              >
                <LogoutOutlined />
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="block py-3.5 text-[15px] font-semibold uppercase tracking-[0.08em] no-underline text-primary hover:text-[#555] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Đăng Nhập / Đăng Ký
            </Link>
          )}
        </nav>
      </Drawer>
    </header>
  );
};

/* ── Reusable icon button ── */
const IconBtn = ({ children, onClick, aria, className = '' }) => (
  <button
    onClick={onClick}
    aria-label={aria}
    className={`w-10 h-10 flex items-center justify-center rounded-full text-[18px] text-primary bg-transparent border-none cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] ${className}`}
  >
    {children}
  </button>
);

/* ── SearchBar with Dropdown Recommendations ── */
const SearchBar = ({ navigate }) => {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({ keyword: val.trim(), limit: 6 });
        setResults(data.products || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (product) => {
    setQuery('');
    setOpen(false);
    setResults([]);
    navigate(`/products/${product._id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/products?keyword=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-[#999] text-[15px] pointer-events-none">
            <SearchOutlined />
          </span>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Tìm kiếm sản phẩm..."
            className="h-9 w-[220px] pl-9 pr-8 rounded-full border border-[#e5e5e5] bg-[#f7f7f7] text-[13px] text-[#1a1a1a] placeholder-[#bbb] outline-none transition-all duration-200 focus:w-[270px] focus:border-[#1a1a1a] focus:bg-white focus:shadow-[0_0_0_2px_rgba(26,26,26,0.08)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
              className="absolute right-3 text-[#aaa] hover:text-[#555] bg-transparent border-none cursor-pointer p-0 flex items-center text-[12px]"
            >
              <CloseOutlined />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[360px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.13)] border border-[#f0f0f0] z-[9999] overflow-hidden animate-fade-in-up">
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-[#888] text-[13px]">
              <span className="w-4 h-4 border-2 border-[#ccc] border-t-[#1a1a1a] rounded-full animate-spin inline-block" />
              Đang tìm kiếm...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[#aaa]">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <>
              <p className="text-[11px] text-[#aaa] uppercase tracking-widest px-4 pt-3.5 pb-1.5 m-0 font-semibold">
                Gợi ý tìm kiếm
              </p>
              <ul className="m-0 p-0 list-none">
                {results.map((product) => (
                  <li key={product._id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(product)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent border-none cursor-pointer text-left transition-colors duration-150 hover:bg-[#f7f7f7] group"
                    >
                      {/* Ảnh thumbnail */}
                      <span className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#f0f0f0]">
                        <img
                          src={product.images?.[0] || ''}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </span>
                      {/* Thông tin */}
                      <span className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] font-semibold text-[#1a1a1a] truncate group-hover:text-[#333]">
                          {product.name}
                        </span>
                        <span className="text-[12px] text-[#e63946] font-bold mt-0.5">
                          {product.isOnSale && product.salePrice
                            ? product.salePrice.toLocaleString('vi-VN') + '₫'
                            : product.price?.toLocaleString('vi-VN') + '₫'}
                        </span>
                      </span>
                      {/* Icon mũi tên */}
                      <span className="text-[#ccc] group-hover:text-[#999] text-[12px] shrink-0">›</span>
                    </button>
                  </li>
                ))}
              </ul>
              {/* Xem tất cả */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 text-center text-[12px] font-semibold text-[#1a1a1a] bg-[#f7f7f7] border-none border-t border-[#f0f0f0] cursor-pointer hover:bg-[#efefef] transition-colors"
              >
                Xem tất cả kết quả cho "<span className="italic">{query}</span>"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MainHeader;
