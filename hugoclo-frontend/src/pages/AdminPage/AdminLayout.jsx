// ============================================================
// AdminLayout — Shared sidebar + header wrapper for all admin pages
// ============================================================

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined, ShoppingOutlined, TagOutlined,
  ShoppingCartOutlined, TeamOutlined, BarChartOutlined,
  SettingOutlined, LogoutOutlined, BellOutlined,
  DownOutlined, HomeOutlined, MenuOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Dropdown, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import hugocloLogo from '../../assets/hugoclo_logo.png';

const navItems = [
  { key: '/admin',            label: 'Dashboard',   icon: <AppstoreOutlined /> },
  { key: '/admin/products',   label: 'Sản Phẩm',    icon: <ShoppingOutlined /> },
  { key: '/admin/categories', label: 'Danh Mục',    icon: <TagOutlined /> },
  { key: '/admin/orders',     label: 'Đơn Hàng',    icon: <ShoppingCartOutlined /> },
  { key: '/admin/customers',  label: 'Khách Hàng',  icon: <TeamOutlined /> },
  { key: '/admin/analytics',  label: 'Phân Tích',   icon: <BarChartOutlined /> },
  { key: '/admin/settings',   label: 'Cài Đặt',     icon: <SettingOutlined /> },
];

const AdminLayout = ({ children, breadcrumb, title, headerRight }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isDesktopExpanded = isHovered;

  const handleLogout = () => {
    logout();
    message.success('Đã đăng xuất');
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'home',
      label: (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-[13px] text-[#444] p-0 w-full"
        >
          <HomeOutlined /> Về Trang Chủ
        </button>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-[13px] text-red-500 p-0 w-full"
        >
          <LogoutOutlined /> Đăng Xuất
        </button>
      ),
    },
  ];

  const activeKey = navItems.find(n => location.pathname === n.key)?.key
    || navItems.find(n => location.pathname.startsWith(n.key) && n.key !== '/admin')?.key
    || '/admin';

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Overlay cho Mobile ── */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside 
        className={`min-h-screen bg-[#1a1a1a] flex flex-col fixed top-0 left-0 z-50 transform transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          w-[240px] ${isDesktopExpanded ? 'md:w-[240px]' : 'md:w-[80px]'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between py-6 border-b border-white/10 transition-all duration-300 ${isDesktopExpanded ? 'px-4' : 'px-0 justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-1 shadow-sm">
              <img src={hugocloLogo} alt="HugoClo" className="w-full h-full object-contain" />
            </div>
            <div className={`transition-all duration-300 overflow-hidden flex flex-col justify-center ${isDesktopExpanded ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0'}`}>
              <p className="text-white text-[13px] font-black tracking-[0.12em] m-0 leading-tight whitespace-nowrap">HUGOCLO</p>
              <p className="text-white/40 text-[10px] font-semibold tracking-[0.2em] m-0 whitespace-nowrap">ADMIN</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1.5 px-3 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                navigate(key);
                setIsMobileMenuOpen(false);
              }}
              title={!isDesktopExpanded ? label : ''}
              className={`group flex items-center py-2.5 rounded-xl border-none text-[13px] font-medium cursor-pointer transition-all duration-300 text-left w-full
                ${isDesktopExpanded ? 'px-3 gap-3' : 'px-0 justify-center gap-0'}
                ${activeKey === key
                  ? 'bg-white/10 text-white font-semibold shadow-[inset_4px_0_0_0_#fff]'
                  : 'bg-transparent text-white/55 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className={`text-[18px] flex-shrink-0 transition-transform duration-300 ${activeKey === key ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden flex-1 ${isDesktopExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
                {label}
              </span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={!isDesktopExpanded ? 'Đăng Xuất' : ''}
          className={`flex items-center py-4 mb-2 mx-3 rounded-xl border-none bg-red-500/10 text-red-400 text-[13px] font-semibold cursor-pointer hover:bg-red-500/20 hover:text-red-300 transition-all duration-300
            ${isDesktopExpanded ? 'px-4 gap-3' : 'px-0 justify-center gap-0'}
          `}
        >
          <span className="text-[18px] flex-shrink-0"><LogoutOutlined /></span>
          <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isDesktopExpanded ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0'}`}>
            Đăng Xuất
          </span>
        </button>
      </aside>

      {/* ── Main ── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden ml-0 ${isDesktopExpanded ? 'md:ml-[240px]' : 'md:ml-[80px]'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#f0f0f0] px-4 md:px-8 py-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden mr-3 text-lg border-none bg-transparent cursor-pointer flex items-center text-[#1a1a1a]"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuOutlined />
            </button>

            <div>
              <p className="text-[11px] font-bold text-[#bbb] uppercase tracking-[0.08em] m-0 mb-0.5">
                {breadcrumb}
              </p>
              <h1 className="text-[20px] md:text-[22px] font-black text-[#1a1a1a] m-0 leading-tight">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {headerRight}
            <Badge count={3} size="small">
              <button className="w-9 h-9 md:w-10 md:h-10 rounded-full border-[1.5px] border-[#ebebeb] bg-white flex items-center justify-center text-[#555] hover:border-[#1a1a1a] transition-colors cursor-pointer">
                <BellOutlined className="text-[16px] md:text-[18px]" />
              </button>
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <button className="flex items-center gap-2 px-1 md:px-2 py-1.5 rounded-lg hover:bg-[#f5f5f5] cursor-pointer border-none bg-transparent transition-colors">
                <Avatar
                  size={32}
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: 13, fontWeight: 700 }}
                >
                  {user?.fullName?.[0] || 'A'}
                </Avatar>
                <DownOutlined className="text-[10px] md:text-[11px] text-[#999]" />
              </button>
            </Dropdown>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 px-4 md:px-8 py-6">
          {children}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default AdminLayout;
