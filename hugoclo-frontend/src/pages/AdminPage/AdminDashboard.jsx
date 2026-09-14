// ============================================================
// AdminDashboard — Tailwind CSS + Ant Design
// Route: /admin (protected, admin only)
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hugocloLogo from '../../assets/hugoclo_logo.png';
import {
  AppstoreOutlined, ShoppingOutlined, TagOutlined,
  ShoppingCartOutlined, TeamOutlined, BarChartOutlined,
  SettingOutlined, LogoutOutlined, BellOutlined,
  DownOutlined, EditOutlined, DeleteOutlined,
  PlusOutlined, DownloadOutlined, ArrowUpOutlined,
  SearchOutlined, HomeOutlined, RiseOutlined,
} from '@ant-design/icons';
import { Input, Table, Tag, Tooltip } from 'antd';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

// ── Sample data ───────────────────────────────────────────────
const revenueData = [
  { day: 'T2', value: 42, pct: 33 },
  { day: 'T3', value: 68, pct: 53 },
  { day: 'T4', value: 51, pct: 40 },
  { day: 'T5', value: 94, pct: 73 },
  { day: 'T6', value: 72, pct: 56 },
  { day: 'T7', value: 128, pct: 100 },
  { day: 'CN', value: 84, pct: 66 },
];

const orderStatus = [
  { label: 'Đang Xử Lý', count: 42,  pct: 22, color: '#f97316', bg: '#fff7ed' },
  { label: 'Hoàn Thành',  count: 128, pct: 68, color: '#22c55e', bg: '#f0fdf4' },
  { label: 'Đã Hủy',      count: 18,  pct: 10, color: '#ef4444', bg: '#fef2f2' },
];

const recentProducts = [
  { key: '1', id: 1, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60&q=80', name: 'Áo Thun Form Boxy', sku: 'SKU-001', category: 'Áo',       categoryColor: 'blue',   price: 250000, stock: 42, status: 'active' },
  { key: '2', id: 2, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=60&q=80', name: 'Quần Wide Leg',    sku: 'SKU-002', category: 'Quần',     categoryColor: 'purple', price: 350000, stock: 7,  status: 'active' },
  { key: '3', id: 3, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=60&q=80', name: 'Áo Polo Classic', sku: 'SKU-003', category: 'Áo',       categoryColor: 'blue',   price: 199000, stock: 0,  status: 'paused' },
  { key: '4', id: 4, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&q=80', name: 'Giày Sneaker Low', sku: 'SKU-004', category: 'Giày',     categoryColor: 'gold',   price: 680000, stock: 15, status: 'active' },
  { key: '5', id: 5, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=60&q=80', name: 'Túi Tote Canvas',  sku: 'SKU-005', category: 'Phụ Kiện', categoryColor: 'green',  price: 145000, stock: 88, status: 'active' },
  { key: '5', id: 5, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=60&q=80', name: 'Túi Tote Canvas',  sku: 'SKU-005', category: 'Phụ Kiện', categoryColor: 'green',  price: 145000, stock: 88, status: 'active' },
];

const formatPrice = (n) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace('.0', '') + 'tr đ'
    : n.toLocaleString('vi-VN') + 'đ';

// ── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ title, value, trend, trendLabel, icon, accentColor }) => (
  <div
    className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col gap-3"
    style={{ borderLeft: `4px solid ${accentColor}` }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] m-0 mb-2">{title}</p>
        <p className="text-[26px] font-black text-[#1a1a1a] m-0 leading-none">{value}</p>
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px]"
        style={{ background: `${accentColor}18`, color: accentColor }}
      >
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[12px] font-bold px-2 py-0.5 rounded-full">
        <ArrowUpOutlined style={{ fontSize: 10 }} /> {trend}
      </span>
      <span className="text-[12px] text-[#bbb]">{trendLabel}</span>
    </div>
  </div>
);

// ── Bar Chart ─────────────────────────────────────────────────
const BarChart = () => (
  <div className="flex items-end gap-2 h-[180px] pt-4">
    {revenueData.map((d) => (
      <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
        <Tooltip title={`${d.value * 100_000}đ`}>
          <div
            className="w-full rounded-t-lg cursor-pointer transition-all duration-300 hover:opacity-80"
            style={{
              height: `${(d.pct / 100) * 140}px`,
              background: d.pct === 100
                ? '#1a1a1a'
                : `linear-gradient(180deg, #444 0%, #888 100%)`,
              minHeight: 8,
            }}
          />
        </Tooltip>
        <span className="text-[11px] text-[#aaa] font-medium">{d.day}</span>
      </div>
    ))}
  </div>
);

// ── Donut Chart (CSS) ─────────────────────────────────────────
const DonutChart = () => {
  const total = orderStatus.reduce((s, d) => s + d.count, 0);
  let offset = 0;
  const r = 60, cx = 80, cy = 80, stroke = 28;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={stroke} stroke="#f3f4f6" />
        {orderStatus.map((d) => {
          const dash = (d.pct / 100) * circ;
          const gap = circ - dash;
          const el = (
            <circle
              key={d.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              strokeWidth={stroke}
              stroke={d.color}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ / 100 + circ / 4}
              strokeLinecap="round"
              style={{ transition: 'all 0.5s' }}
            />
          );
          offset += d.pct;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1a1a1a">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#aaa">đơn</text>
      </svg>
      <div className="w-full flex flex-col gap-2 mt-2">
        {orderStatus.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="flex-1 text-[12px] text-[#666]">{d.label}</span>
            <span className="text-[12px] font-bold text-[#1a1a1a]">{d.count}</span>
            <span className="text-[11px] text-[#bbb]">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Table columns ─────────────────────────────────────────────
const columns = [
  {
    title: '#',
    dataIndex: 'id',
    width: 44,
    render: (v) => <span className="text-[#bbb] font-semibold text-[13px]">{v}</span>,
  },
  {
    title: 'Hình',
    dataIndex: 'img',
    width: 60,
    render: (src, r) => (
      <img src={src} alt={r.name} className="w-11 h-11 rounded-xl object-cover border border-[#f0f0f0]" />
    ),
  },
  {
    title: 'Tên Sản Phẩm',
    dataIndex: 'name',
    render: (v, r) => (
      <div>
        <p className="font-semibold text-[13px] text-[#1a1a1a] m-0 leading-tight">{v}</p>
        <p className="text-[11px] text-[#bbb] m-0 mt-0.5">{r.sku}</p>
      </div>
    ),
  },
  {
    title: 'Danh Mục',
    dataIndex: 'category',
    render: (v, r) => <Tag color={r.categoryColor} className="rounded-full font-semibold">{v}</Tag>,
  },
  {
    title: 'Giá',
    dataIndex: 'price',
    render: (v) => <span className="font-bold text-[13px] text-[#1a1a1a] whitespace-nowrap">{formatPrice(v)}</span>,
  },
  {
    title: 'Tồn Kho',
    dataIndex: 'stock',
    render: (v) => (
      <span className={`font-bold text-[13px] ${v === 0 ? 'text-red-500' : v < 10 ? 'text-orange-500' : 'text-green-600'}`}>
        {v === 0 ? 'Hết hàng' : v}
      </span>
    ),
  },
  {
    title: 'Trạng Thái',
    dataIndex: 'status',
    render: (v) => (
      <Tag
        color={v === 'active' ? 'success' : 'default'}
        className="rounded-full font-semibold"
      >
        {v === 'active' ? 'Hoạt Động' : 'Tạm Dừng'}
      </Tag>
    ),
  },
  {
    title: 'Thao Tác',
    render: () => (
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 border-none cursor-pointer flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
          <EditOutlined style={{ fontSize: 13 }} />
        </button>
        <button className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border-none cursor-pointer flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
          <DeleteOutlined style={{ fontSize: 13 }} />
        </button>
      </div>
    ),
  },
];

// ── Main Component ────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <AdminLayout
      breadcrumb="Dashboard"
      title={<span>Chào Buổi Sáng, {user?.fullName?.split(' ').pop() || 'Admin'}! 👋</span>}
    >
      <div className="flex flex-col gap-5">
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Tổng Sản Phẩm"    value="156"         trend="+12"  trendLabel="tháng này"      icon={<ShoppingOutlined />}     accentColor="#3b82f6" />
          <StatCard title="Tổng Danh Mục"    value="8"           trend="+2"   trendLabel="mới thêm"       icon={<TagOutlined />}          accentColor="#22c55e" />
          <StatCard title="Đơn Hàng Hôm Nay" value="34"          trend="+18%" trendLabel="vs hôm qua"     icon={<ShoppingCartOutlined />}  accentColor="#f97316" />
          <StatCard title="Doanh Thu Tháng"  value="28.45tr đ"   trend="+24%" trendLabel="vs tháng trước" icon={<RiseOutlined />}         accentColor="#8b5cf6" />
        </div>

        {/* Charts row */}
        <div className="flex gap-4">
          {/* Bar chart — revenue */}
          <div className="flex-[1.5] bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-[15px] font-bold text-[#1a1a1a] m-0 mb-1">Doanh Thu 7 Ngày Qua</h3>
                <p className="text-[12px] text-[#999] m-0">Tổng: <strong className="text-[#1a1a1a]">54.35tr đ</strong></p>
              </div>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[12px] font-bold px-2.5 py-1 rounded-full">
                <ArrowUpOutlined style={{ fontSize: 11 }} /> +18.4%
              </span>
            </div>
            <BarChart />
          </div>

          {/* Donut chart — order status */}
          <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div className="mb-4">
              <h3 className="text-[15px] font-bold text-[#1a1a1a] m-0 mb-1">Trạng Thái Đơn Hàng</h3>
              <p className="text-[12px] text-[#999] m-0">Tổng: <strong className="text-[#1a1a1a]">188 đơn</strong></p>
            </div>
            <DonutChart />
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-xl border-none text-[13px] font-semibold cursor-pointer hover:bg-[#333] hover:-translate-y-px hover:shadow-lg transition-all duration-200">
            <PlusOutlined /> Thêm Sản Phẩm
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a1a1a] rounded-xl border-[1.5px] border-[#e0e0e0] text-[13px] font-semibold cursor-pointer hover:border-[#1a1a1a] hover:-translate-y-px transition-all duration-200">
            <TagOutlined /> Thêm Danh Mục
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a1a1a] rounded-xl border-[1.5px] border-[#e0e0e0] text-[13px] font-semibold cursor-pointer hover:border-[#1a1a1a] hover:-translate-y-px transition-all duration-200">
            <DownloadOutlined /> Xuất Báo Cáo
          </button>
        </div>

        {/* Products table */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f5f5f5]">
            <h3 className="text-[15px] font-bold text-[#1a1a1a] m-0">Sản Phẩm Gần Đây</h3>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Tìm sản phẩm..."
                prefix={<SearchOutlined className="text-[#ccc]" />}
                size="small"
                style={{ width: 180, fontSize: 13 }}
                className="rounded-lg"
              />
              <button className="text-[13px] font-semibold text-[#1a1a1a] bg-transparent border-none cursor-pointer hover:underline whitespace-nowrap">
                Xem Tất Cả →
              </button>
            </div>
          </div>
          <Table
            dataSource={recentProducts}
            columns={columns}
            pagination={false}
            size="middle"
            rowClassName="hover:bg-[#fafafa]"
            className="admin-table-custom"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
