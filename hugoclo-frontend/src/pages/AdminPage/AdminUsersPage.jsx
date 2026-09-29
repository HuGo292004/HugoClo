// ============================================================
// AdminUsersPage — Quản lý người dùng (Admin)
// Route: /admin/customers (protected, admin only)
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Input, Select, Tooltip, Spin, Empty,
  Drawer, Popconfirm, message,
} from 'antd';
import {
  SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined,
  CalendarOutlined, LockOutlined, UnlockOutlined,
  DeleteOutlined, EyeOutlined, ReloadOutlined, TeamOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined,
  WomanOutlined, ManOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  fetchAllUsersAdmin,
  updateUserRoleAdmin,
  toggleUserStatusAdmin,
  deleteUserAdmin,
} from '../../api/userService';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

// ── Helpers ──────────────────────────────────────────────────
const fmtDate  = (d) => d ? dayjs(d).format('DD/MM/YYYY') : '—';
const fmtDT    = (d) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—';
const fmtPrice = (n) =>
  n?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0₫';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name[0].toUpperCase();
};

const AVATAR_COLORS = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a18cd1'];
const getAvatarColor = (id) =>
  AVATAR_COLORS[(id?.charCodeAt(id.length - 1) || 0) % AVATAR_COLORS.length];

// ── Configs ───────────────────────────────────────────────────
// const RANK_CONFIG = {
//   silver:   { label: 'Bạc',      color: '#78716c', bg: '#f5f5f4', icon: '🥈' },
//   gold:     { label: 'Vàng',     color: '#ca8a04', bg: '#fefce8', icon: '🥇' },
//   platinum: { label: 'Bạch kim', color: '#0ea5e9', bg: '#e0f2fe', icon: '💎' },
// };
const ROLE_CONFIG = {
  user:  { label: 'Người dùng', color: '#555',    bg: '#f5f5f5' },
  admin: { label: 'Quản trị',   color: '#7c3aed', bg: '#f5f3ff' },
};
const GENDER_CONFIG = {
  male:   { label: 'Nam',  icon: <ManOutlined />,              color: '#3b82f6' },
  female: { label: 'Nữ',   icon: <WomanOutlined />,            color: '#ec4899' },
  other:  { label: 'Khác', icon: <QuestionCircleOutlined />,   color: '#6b7280' },
  '':     { label: '—',    icon: null,                         color: '#aaa'    },
};

// ── Badges ────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.color }}>
      {role === 'admin' ? <SafetyOutlined /> : <UserOutlined />} {cfg.label}
    </span>
  );
};

const StatusBadge = ({ isActive }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
    style={isActive
      ? { background: '#f0fdf4', color: '#22c55e', border: '1px solid #86efac' }
      : { background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}>
    {isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
    {isActive ? 'Hoạt động' : 'Bị khoá'}
  </span>
);

// const RankBadge = ({ rank }) => {
//   const cfg = RANK_CONFIG[rank] || RANK_CONFIG.silver;
//   return (
//     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
//       style={{ background: cfg.bg, color: cfg.color }}>
//       {cfg.icon} {cfg.label}
//     </span>
//   );
// };

// ── Metric Card ───────────────────────────────────────────────
const MetricCard = ({ title, value, icon, accentColor, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col gap-3"
    style={{ borderLeft: `4px solid ${accentColor}` }}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] m-0 mb-2">{title}</p>
        <p className="text-[26px] font-black text-[#1a1a1a] m-0 leading-none">{value ?? '—'}</p>
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px] flex-shrink-0 ml-2"
        style={{ background: `${accentColor}18`, color: accentColor }}>
        {icon}
      </div>
    </div>
    {sub && <span className="text-[12px] text-[#bbb]">{sub}</span>}
  </div>
);

// ── User Detail Drawer ────────────────────────────────────────
const UserDetailDrawer = ({ user, open, onClose, onUpdate, currentUserId }) => {
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  const isSelf = user._id === currentUserId;
  const shortId    = user._id?.slice(-8).toUpperCase();
  const initials   = getInitials(user.fullName);
  const avatarColor = getAvatarColor(user._id);
  const genderCfg  = GENDER_CONFIG[user.gender || ''] || GENDER_CONFIG[''];

  const handleRoleChange = async (newRole) => {
    setBusy(true);
    try {
      await updateUserRoleAdmin(user._id, newRole);
      message.success(`Đã cập nhật quyền → ${ROLE_CONFIG[newRole]?.label}`);
      onUpdate(); onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Cập nhật quyền thất bại');
    } finally { setBusy(false); }
  };

  const handleToggleStatus = async () => {
    setBusy(true);
    try {
      await toggleUserStatusAdmin(user._id);
      message.success(user.isActive ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản');
      onUpdate(); onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteUserAdmin(user._id);
      message.success('Đã xoá người dùng');
      onUpdate(); onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Xoá thất bại');
    } finally { setBusy(false); }
  };

  return (
    <Drawer
      title={
        <div>
          <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider m-0">Chi tiết người dùng</p>
          <p className="text-[18px] font-black text-[#1a1a1a] m-0">#{shortId}</p>
        </div>
      }
      placement="right" width={520} open={open} onClose={onClose}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <Spin spinning={busy}>
        {/* Avatar & Basic */}
        <div className="bg-gradient-to-br from-[#f8f9fa] to-[#f0f0f0] rounded-2xl p-5 mb-4 flex flex-col items-center text-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.fullName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mb-3" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-black text-white border-4 border-white shadow-md mb-3"
              style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}aa)` }}>
              {initials}
            </div>
          )}
          <p className="text-[18px] font-black text-[#1a1a1a] m-0 mb-1">{user.fullName}</p>
          <p className="text-[13px] text-[#888] m-0 mb-3">{user.email}</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <RoleBadge role={user.role} />
            <StatusBadge isActive={user.isActive} />
            {/* <RankBadge rank={user.memberRank} /> */}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: <><PhoneOutlined /> Số điện thoại</>, value: user.phone || '—' },
            { label: 'Giới tính', value: <span style={{ color: genderCfg.color }}>{genderCfg.icon} {genderCfg.label}</span> },
            { label: <><CalendarOutlined /> Ngày sinh</>, value: fmtDate(user.dob) },
            { label: 'Đã chi tiêu', value: <span className="font-bold">{fmtPrice(user.totalSpent)}</span> },
            { label: 'Ngày đăng ký', value: fmtDT(user.createdAt) },
            { label: 'Cập nhật lần cuối', value: fmtDT(user.updatedAt) },
          ].map((item, i) => (
            <div key={i} className="bg-[#f8f9fa] rounded-xl p-3">
              <p className="text-[11px] text-[#aaa] m-0 mb-1 flex items-center gap-1">{item.label}</p>
              <p className="text-[13px] font-semibold text-[#1a1a1a] m-0">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="border-t border-[#f0f0f0] pt-4">
          <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider m-0 mb-3">Thao tác</p>

          {/* Role */}
          {/* <div className="bg-[#f8f9fa] rounded-xl p-3 mb-3">
            <p className="text-[12px] font-semibold text-[#555] m-0 mb-2">Thay đổi quyền</p>
            <div className="flex gap-2">
              {['user', 'admin'].map((r) => {
                const cfg = ROLE_CONFIG[r];
                const isCurrent = user.role === r;
                return (
                  <button key={r} onClick={() => !isCurrent && handleRoleChange(r)}
                    disabled={isCurrent || busy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all duration-200 border"
                    style={isCurrent
                      ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }
                      : { background: '#fff', color: '#888', border: '1px solid #e5e5e5' }}>
                    {r === 'admin' ? <SafetyOutlined /> : <UserOutlined />}
                    {cfg.label}{isCurrent && ' ✓'}
                  </button>
                );
              })}
            </div>
          </div> */}

          {/* Toggle Status */}
          {isSelf ? (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold mb-3"
              style={{ background: '#f5f5f5', color: '#aaa', border: '1px solid #e5e5e5' }}>
              <LockOutlined /> Không thể khoá tài khoản của chính mình
            </div>
          ) : (
            <button onClick={handleToggleStatus} disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold cursor-pointer transition-all duration-200 mb-3 hover:-translate-y-px"
              style={user.isActive
                ? { background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }
                : { background: '#f0fdf4', color: '#22c55e', border: '1px solid #86efac' }}>
              {user.isActive ? <LockOutlined /> : <UnlockOutlined />}
              {user.isActive ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
            </button>
          )}

          {/* Delete */}
          {isSelf ? (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold"
              style={{ background: '#f5f5f5', color: '#aaa', border: '1px solid #e5e5e5' }}>
              <DeleteOutlined /> Không thể xoá tài khoản của chính mình
            </div>
          ) : (
            <Popconfirm
              title="Xác nhận xoá người dùng"
              description={`Bạn có chắc muốn xoá "${user.fullName}"? Hành động này không thể hoàn tác.`}
              onConfirm={handleDelete}
              okText="Xoá" cancelText="Huỷ"
              okButtonProps={{ danger: true, loading: busy }}
              icon={<DeleteOutlined style={{ color: '#ef4444' }} />}
            >
              <button disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-px"
                style={{ background: '#fff', color: '#ef4444', border: '1px solid #fca5a5' }}>
                <DeleteOutlined /> Xoá người dùng
              </button>
            </Popconfirm>
          )}
        </div>
      </Spin>
    </Drawer>
  );
};

// ── Status Tabs ───────────────────────────────────────────────
const STATUS_TABS = [
  { key: 'all',     label: 'Tất cả'    },
  { key: 'active',  label: 'Hoạt động' },
  { key: 'blocked', label: 'Bị khoá'   },
];

// ── Main Component ────────────────────────────────────────────
const AdminUsersPage = () => {
  const { user: authUser }            = useAuth();
  const currentUserId                 = authUser?.id || authUser?._id;
  const [users, setUsers]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [stats, setStats]             = useState({});
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [tabStatus, setTabStatus]     = useState('all');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [rankFilter, setRankFilter]   = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const searchTimeout                 = useRef(null);
  const LIMIT = 10;

  const buildParams = useCallback(() => ({
    page, limit: LIMIT,
    search: search || undefined,
    status: tabStatus !== 'all' ? tabStatus : undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    memberRank: rankFilter !== 'all' ? rankFilter : undefined,
    sortBy: 'createdAt', sortOrder: 'desc',
  }), [page, tabStatus, search, roleFilter, rankFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsersAdmin(buildParams());
      setUsers(res.users || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setStats(res.stats || {});
    } catch {
      message.error('Không thể tải danh sách người dùng');
    } finally { setLoading(false); }
  }, [buildParams]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1); }, 500);
  };

  const handleTabChange = (key) => { setTabStatus(key); setPage(1); };

  const openDetail = (user) => { setSelectedUser(user); setDrawerOpen(true); };

  // ── Table Columns ─────────────────────────────────────────
  const columns = [
    {
      title: 'Người dùng', width: 260,
      render: (_, r) => {
        const initials = getInitials(r.fullName);
        const color    = getAvatarColor(r._id);
        return (
          <div className="flex items-center gap-3">
            {r.avatar ? (
              <img src={r.avatar} alt={r.fullName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#f0f0f0] flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-black text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}>
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-[13px] text-[#1a1a1a] m-0 truncate max-w-[170px]">{r.fullName}</p>
              <p className="text-[11px] text-[#aaa] m-0 truncate max-w-[170px]">
                <MailOutlined className="mr-1" />{r.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số điện thoại', dataIndex: 'phone', width: 130,
      render: (v) => <span className="text-[12px] text-[#555]">{v ? <><PhoneOutlined className="mr-1 text-[#aaa]" />{v}</> : '—'}</span>,
    },
    {
      title: 'Quyền', dataIndex: 'role', width: 120, align: 'center',
      render: (r) => <RoleBadge role={r} />,
    },
    // {
    //   title: 'Hạng', dataIndex: 'memberRank', width: 110, align: 'center',
    //   render: (r) => <RankBadge rank={r} />,
    // },
    {
      title: 'Chi tiêu', dataIndex: 'totalSpent', width: 130, align: 'center',
      render: (v) => <span className="font-bold text-[13px] text-[#1a1a1a] whitespace-nowrap">{fmtPrice(v)}</span>,
    },
    {
      title: 'Trạng thái', dataIndex: 'isActive', width: 130, align: 'center',
      render: (v) => <StatusBadge isActive={v} />,
    },
    {
      title: 'Ngày đăng ký', dataIndex: 'createdAt', width: 130,
      render: (d) => <span className="text-[12px] text-[#888]">{fmtDT(d)}</span>,
    },
    {
      title: 'Thao tác', width: 160, align: 'center', fixed: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Xem chi tiết">
            <button onClick={(e) => { e.stopPropagation(); openDetail(r); }}
              className="w-8 h-8 rounded-lg bg-[#f5f5f5] text-[#555] border-none cursor-pointer flex items-center justify-center hover:bg-[#1a1a1a] hover:text-white transition-all duration-200">
              <EyeOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>

          <Tooltip title={r.isActive ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}>
            {r._id === currentUserId ? (
              <Tooltip title="Không thể khoá chính mình">
                <button disabled
                  className="w-8 h-8 rounded-lg border-none flex items-center justify-center opacity-30 cursor-not-allowed"
                  style={{ background: '#f5f5f5', color: '#aaa' }}>
                  <LockOutlined style={{ fontSize: 13 }} />
                </button>
              </Tooltip>
            ) : (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await toggleUserStatusAdmin(r._id);
                    message.success(r.isActive ? 'Đã khoá tài khoản' : 'Đã mở khoá');
                    loadUsers();
                  } catch (err) { message.error(err?.response?.data?.message || 'Thao tác thất bại'); }
                }}
                className="w-8 h-8 rounded-lg border-none cursor-pointer flex items-center justify-center transition-all duration-200"
                style={r.isActive ? { background: '#fef2f2', color: '#ef4444' } : { background: '#f0fdf4', color: '#22c55e' }}>
                {r.isActive ? <LockOutlined style={{ fontSize: 13 }} /> : <UnlockOutlined style={{ fontSize: 13 }} />}
              </button>
            )}
          </Tooltip>

          <Popconfirm
            title="Xoá người dùng?" description="Hành động này không thể hoàn tác."
            onConfirm={async () => {
              try {
                await deleteUserAdmin(r._id);
                message.success('Đã xoá người dùng');
                loadUsers();
              } catch (err) { message.error(err?.response?.data?.message || 'Xoá thất bại'); }
            }}
            okText="Xoá" cancelText="Huỷ" okButtonProps={{ danger: true }}
            disabled={r._id === currentUserId}
          >
            <Tooltip title={r._id === currentUserId ? 'Không thể xoá chính mình' : 'Xoá'}>
              <button onClick={(e) => e.stopPropagation()}
                disabled={r._id === currentUserId}
                className="w-8 h-8 rounded-lg bg-[#fef2f2] text-[#ef4444] border-none cursor-pointer flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#fef2f2] disabled:hover:text-[#ef4444]">
                <DeleteOutlined style={{ fontSize: 13 }} />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Tab colors
  const TAB_COLORS = { all: '#1a1a1a', active: '#22c55e', blocked: '#ef4444' };
  const TAB_BGS    = { all: '#f5f5f5', active: '#f0fdf4', blocked: '#fef2f2' };
  const TAB_COUNTS = { all: stats.totalAll, active: stats.totalActive, blocked: stats.totalBlocked };

  return (
    <AdminLayout
      title="Quản Lý Người Dùng"
      // headerRight={
      //   <Tooltip title="Làm mới">
      //     <button onClick={loadUsers}
      //       className="w-10 h-10 rounded-xl bg-white border-[1.5px] border-[#e0e0e0] text-[#555] cursor-pointer flex items-center justify-center hover:border-[#1a1a1a] transition-colors">
      //       <ReloadOutlined style={{ fontSize: 15 }} />
      //     </button>
      //   </Tooltip>
      // }
    >
      <div className="flex flex-col gap-5">

        {/* ── Metric Cards ── */}
        {/* <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Tổng người dùng"  value={stats.totalAll}     icon={<TeamOutlined />}          accentColor="#1a1a1a" sub="Tất cả tài khoản" />
          <MetricCard title="Đang hoạt động"   value={stats.totalActive}  icon={<CheckCircleOutlined />}   accentColor="#22c55e" sub="Tài khoản bình thường" />
          <MetricCard title="Bị khoá"           value={stats.totalBlocked} icon={<LockOutlined />}          accentColor="#ef4444" sub="Tài khoản bị hạn chế" />
          <MetricCard title="Quản trị viên"     value={stats.totalAdmin}   icon={<SafetyOutlined />}        accentColor="#7c3aed" sub="Có quyền admin" />
        </div> */}

        {/* ── Main Table Card ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">

          {/* Status Tabs */}
          <div className="border-b border-[#f5f5f5] px-6">
            <div className="flex items-center gap-0 overflow-x-auto">
              {STATUS_TABS.map((tab) => {
                const isActive = tabStatus === tab.key;
                const clr = TAB_COLORS[tab.key];
                const cnt = TAB_COUNTS[tab.key];
                return (
                  <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                    className="flex items-center gap-2 px-4 py-4 border-none bg-transparent text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all duration-200"
                    style={{ color: isActive ? clr : '#888', borderBottom: `2px solid ${isActive ? clr : 'transparent'}` }}>
                    {tab.label}
                    {cnt !== undefined && (
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                        style={{ background: isActive ? TAB_BGS[tab.key] : '#f5f5f5', color: isActive ? clr : '#888' }}>
                        {cnt}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 px-6 py-5 border-b border-[#f5f5f5] flex-wrap">
            <Input
              placeholder="Tìm theo tên, email, số điện thoại..."
              prefix={<SearchOutlined className="text-[#ccc]" />}
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              size="large" className="rounded-xl w-full md:max-w-[400px]" allowClear
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              <Select value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }}
                size="large" className="rounded-xl w-full sm:w-[160px]"
                options={[
                  { value: 'all',   label: 'Tất cả quyền' },
                  { value: 'user',  label: 'Người dùng' },
                  { value: 'admin', label: 'Quản trị viên' },
                ]} />
              {/* <Select value={rankFilter} onChange={(v) => { setRankFilter(v); setPage(1); }}
                size="large" className="rounded-xl w-full sm:w-[160px]"
                options={[
                  { value: 'all',      label: 'Tất cả hạng' },
                  { value: 'silver',   label: '🥈 Bạc' },
                  { value: 'gold',     label: '🥇 Vàng' },
                  { value: 'platinum', label: '💎 Bạch kim' },
                ]} /> */}
            </div>
          </div>

          {/* Table */}
          <div style={{ minHeight: 400 }}>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spin size="large" tip="Đang tải người dùng..." />
              </div>
            ) : users.length === 0 ? (
              <Empty className="py-16" description={<span className="text-[#aaa] text-[13px]">Không tìm thấy người dùng nào</span>} />
            ) : (
              <Table dataSource={users} columns={columns} rowKey="_id" pagination={false}
                size="middle" scroll={{ x: 1100 }} rowClassName="hover:bg-[#fafafa] cursor-pointer"
                onRow={(r) => ({ onClick: () => openDetail(r) })} />
            )}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#f5f5f5]">
              <span className="text-[12px] text-[#aaa]">
                Trang {page} / {totalPages} · {total.toLocaleString('vi-VN')} người dùng
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] font-semibold bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  ← Trước
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg border text-[13px] font-semibold cursor-pointer transition-all duration-200"
                      style={page === p
                        ? { background: '#1a1a1a', color: '#fff', border: '1px solid #1a1a1a' }
                        : { background: '#fff', color: '#555', border: '1px solid #e5e5e5' }}>
                      {p}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-[#aaa]">...</span>}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] font-semibold bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      <UserDetailDrawer user={selectedUser} open={drawerOpen}
        onClose={() => setDrawerOpen(false)} onUpdate={loadUsers}
        currentUserId={currentUserId} />
    </AdminLayout>
  );
};

export default AdminUsersPage;
