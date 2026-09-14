// ============================================================
// AdminLayout — Shared sidebar + header wrapper for all admin pages
// ============================================================

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined, ShoppingOutlined, TagOutlined,
  ShoppingCartOutlined, TeamOutlined, BarChartOutlined,
  SettingOutlined, LogoutOutlined, BellOutlined,
  DownOutlined, HomeOutlined,
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

      {/* ── Sidebar ── */}
      <aside className="w-[240px] min-h-screen bg-[#1a1a1a] flex flex-col fixed top-0 left-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
            <img src={hugocloLogo} alt="HugoClo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white text-[13px] font-black tracking-[0.12em] m-0 leading-tight">HUGOCLO</p>
            <p className="text-white/40 text-[10px] font-semibold tracking-[0.2em] m-0">ADMIN</p>
          </div>
        </div>

        {/* Admin info */}
        {/* <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <Avatar
            size={36}
            className="flex-shrink-0 font-bold"
            style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: 15 }}
          >
            {user?.fullName?.[0] || 'A'}
          </Avatar>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold m-0 leading-tight truncate">{user?.fullName || 'Admin'}</p>
            <p className="text-white/40 text-[11px] m-0">Super Admin</p>
          </div>
        </div> */}

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-3">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-none text-[13px] font-medium cursor-pointer transition-all duration-200 text-left w-full ${
                activeKey === key
                  ? 'bg-white/12 text-white font-semibold'
                  : 'bg-transparent text-white/55 hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className="text-[16px]">{icon}</span>
              <span className="flex-1">{label}</span>
              {activeKey === key && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 border-none bg-transparent text-red-400 text-[13px] font-semibold cursor-pointer hover:opacity-75 transition-opacity border-t border-white/[0.06]"
        >
          <LogoutOutlined /> Đăng Xuất
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="ml-[240px] flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0] px-8 py-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div>
            <p className="text-[11px] font-bold text-[#bbb] uppercase tracking-[0.08em] m-0 mb-1">
              {breadcrumb}
            </p>
            <h1 className="text-[22px] font-black text-[#1a1a1a] m-0 leading-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {headerRight}
            <Badge count={3} size="small">
              <button className="w-10 h-10 rounded-full border-[1.5px] border-[#ebebeb] bg-white flex items-center justify-center text-[#555] hover:border-[#1a1a1a] transition-colors cursor-pointer">
                <BellOutlined style={{ fontSize: 18 }} />
              </button>
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f5] cursor-pointer border-none bg-transparent transition-colors">
                <Avatar
                  size={32}
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: 13, fontWeight: 700 }}
                >
                  {user?.fullName?.[0] || 'A'}
                </Avatar>
                <DownOutlined style={{ fontSize: 11, color: '#999' }} />
              </button>
            </Dropdown>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
