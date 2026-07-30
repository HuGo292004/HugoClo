// ============================================================
// MainHeader — Logo, Nav, Search, Cart, Auth (Tailwind CSS)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Badge, Input, Drawer, Dropdown, message } from 'antd';
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
  { key: 'products', label: 'Sản Phẩm', navigate: '/products' },
  { key: 'men',        label: 'Nam' },
  { key: 'women',      label: 'Nữ' },
  { key: 'collection', label: 'Bộ Sưu Tập' },
  { key: 'sale',       label: 'Sale', highlight: true },
];

const MainHeader = () => {
  const [searchOpen,     setSearchOpen]     = useState(false);
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
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt tài khoản',
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
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.navigate || `#${item.key}`}
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
          ))}
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Search */}
          {searchOpen ? (
            <Input
              autoFocus
              placeholder="Tìm kiếm sản phẩm..."
              className="w-[240px] rounded-full! border-[#e5e5e5]! text-[13px]! h-9!"
              suffix={
                <CloseOutlined
                  className="text-[#888] cursor-pointer"
                  onClick={() => setSearchOpen(false)}
                />
              }
              onPressEnter={() => setSearchOpen(false)}
            />
          ) : (
            <IconBtn onClick={() => setSearchOpen(true)} aria="Tìm kiếm">
              <SearchOutlined />
            </IconBtn>
          )}

          {/* Wishlist */}
          <IconBtn aria="Danh sách yêu thích">
            <HeartOutlined />
          </IconBtn>

          {/* Cart */}
          <IconBtn aria="Giỏ hàng">
            <Badge count={isLoggedIn ? cartCount : 0} size="small" color="#1a1a1a" offset={[2, -2]}>
              <ShoppingCartOutlined className="text-[18px]" />
            </Badge>
          </IconBtn>

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
                <span className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                  {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
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
          {NAV_ITEMS.map((item) => (
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
          ))}
          <div className="h-4" />
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 py-3 border-b border-[#f0f0f0]">
                <span className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[13px] font-bold">
                  {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
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

export default MainHeader;
