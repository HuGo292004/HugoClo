// ============================================================
// ProfilePage — Hồ Sơ Của Tôi
// Route: /profile (protected, user only)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message, Spin, Modal, DatePicker } from 'antd';
import dayjs from 'dayjs';
import {
  UserOutlined, ShoppingOutlined, EnvironmentOutlined,
  HeartOutlined, LockOutlined, CameraOutlined, CheckCircleOutlined,
  GoogleOutlined, EditOutlined, SaveOutlined, CloseOutlined,
  SafetyOutlined, DeleteOutlined, ExclamationCircleOutlined,
  StarOutlined, ArrowRightOutlined, EyeOutlined, EyeInvisibleOutlined,
  PhoneOutlined, MailOutlined, ManOutlined, WomanOutlined,
  CalendarOutlined, LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateMyProfile, changePassword, uploadAvatar } from '../../api/userService';

// ── Navigation items ───────────────────────────────────────────
// const NAV_ITEMS = [
//   { key: 'profile',   label: 'Thông tin cá nhân', icon: <UserOutlined />,        path: '/profile' },
//   { key: 'orders',    label: 'Đơn hàng',           icon: <ShoppingOutlined />,    path: '/my-orders' },
//   { key: 'addresses', label: 'Sổ địa chỉ',         icon: <EnvironmentOutlined />, path: '/addresses' },
//   { key: 'wishlist',  label: 'Yêu thích',           icon: <HeartOutlined />,       path: '/wishlist' },
//   { key: 'security',  label: 'Bảo mật',             icon: <LockOutlined />,        path: '/profile#security' },
// ];

// ── Member rank config ─────────────────────────────────────────
const RANK_CONFIG = {
  silver:   { label: 'Silver',   color: '#94a3b8', bg: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', next: 'Gold',     nextSpend: 5000000,  icon: '🥈' },
  gold:     { label: 'Gold VIP', color: '#d4af37', bg: 'linear-gradient(135deg,#fef9c3,#fde68a)', next: 'Platinum', nextSpend: 20000000, icon: '🥇' },
  platinum: { label: 'Platinum', color: '#8b5cf6', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', next: null,       nextSpend: null,     icon: '💎' },
};

// ── Helpers ────────────────────────────────────────────────────
const fmtPrice = (n) =>
  n?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0₫';

const InputField = ({ label, id, icon, type = 'text', value, onChange, disabled, badge, hint, suffix }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-[12px] font-bold text-[#888] uppercase tracking-[0.06em]">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb] text-[15px]">{icon}</div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-[14px] font-medium text-[#1a1a1a] outline-none transition-all duration-200
          ${disabled
            ? 'bg-[#f8f8f8] border-[#f0f0f0] text-[#aaa] cursor-not-allowed'
            : 'bg-white border-[#e5e5e5] hover:border-[#1a1a1a] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/5'
          }
          ${suffix ? 'pr-24' : ''}`}
      />
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
      {badge && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {badge}
        </div>
      )}
    </div>
    {hint && <p className="text-[11px] text-[#bbb] m-0">{hint}</p>}
  </div>
);

const PasswordField = ({ label, id, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-bold text-[#888] uppercase tracking-[0.06em]">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb] text-[15px]"><LockOutlined /></div>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#e5e5e5] text-[14px] font-medium text-[#1a1a1a] outline-none transition-all duration-200 hover:border-[#1a1a1a] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/5 bg-white"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#555] border-none bg-transparent cursor-pointer text-[15px] transition-colors"
        >
          {show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────
const ProfilePage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const securityRef = useRef(null);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Form state
  const [form, setForm] = useState({
    fullName: '', phone: '', gender: '', dob: '',
  });

  // Password form
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA toggle
  const [twoFA, setTwoFA] = useState(false);

  // Avatar preview
  const [avatarPreview, setAvatarPreview] = useState(null);

  // ── Load profile ───────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    if (!token) { navigate('/auth'); return; }
    setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
      setForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        gender: data.gender || '',
        dob: data.dob ? data.dob.slice(0, 10) : '',
      });
    } catch {
      // Fallback to user from AuthContext
      if (user) {
        setProfile(user);
        setForm({ fullName: user.fullName || '', phone: user.phone || '', gender: '', dob: '' });
      }
    } finally {
      setLoading(false);
    }
  }, [token, user, navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // Scroll to security section if hash
  useEffect(() => {
    if (location.hash === '#security' && securityRef.current) {
      setTimeout(() => securityRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
      setActiveSection('security');
    }
  }, [location.hash]);

  // ── Save profile ───────────────────────────────────────────
  const handleSave = async () => {
    if (!form.fullName.trim()) { message.warning('Vui lòng nhập họ tên'); return; }
    setSaving(true);
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated.user || updated);
      // Also update localStorage user data
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, fullName: form.fullName, phone: form.phone }));
      message.success('Đã lưu thay đổi thành công!');
      setEditing(false);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Lưu thất bại, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      message.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      message.error('Mật khẩu mới không khớp');
      return;
    }
    if (pwForm.next.length < 6) {
      message.warning('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      message.success('Đã đổi mật khẩu thành công!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      message.error(err?.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Avatar upload ───────────────────────────────────────────
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { message.error('Ảnh không được vượt quá 5MB'); return; }
    
    // Preview
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    // Upload to server
    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const updatedUser = await uploadAvatar(formData);
      
      setProfile(updatedUser.user);
      
      // Update local storage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, avatar: updatedUser.avatar }));
      
      message.success('Đã cập nhật ảnh đại diện');
    } catch (err) {
      message.error(err?.response?.data?.message || 'Không thể tải ảnh lên');
      setAvatarPreview(null); // revert on fail
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Delete account confirm ─────────────────────────────────
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Xóa tài khoản vĩnh viễn?',
      icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
      content: 'Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn.',
      okText: 'Xóa tài khoản',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => message.info('Chức năng xóa tài khoản sẽ được tích hợp.'),
    });
  };

  // ── Derived ────────────────────────────────────────────────
  const displayName = profile?.fullName || user?.fullName || 'Người dùng';
  const email = profile?.email || user?.email || '';
  const rank = profile?.memberRank || 'gold';
  const rankCfg = RANK_CONFIG[rank] || RANK_CONFIG.gold;
  const totalSpent = profile?.totalSpent || 8500000;
  const nextSpend = rankCfg.nextSpend || 20000000;
  const progress = rankCfg.next ? Math.min((totalSpent / nextSpend) * 100, 100) : 100;
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Hero / Page Header ── */}
      <div className="bg-white border-b border-[#f0f0f0]">
        <div className="container-custom py-3">
          <h1 className="text-[28px] font-black text-[#1a1a1a] m-0">Tài Khoản Của Tôi</h1>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="lg:w-[260px] flex-shrink-0 flex flex-col gap-4">
            {/* Avatar Card */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-white text-[30px] font-black cursor-pointer group ${avatarUploading ? 'opacity-50' : ''}`}
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                  onClick={() => !avatarUploading && fileInputRef.current?.click()}
                >
                  {avatarUploading ? (
                    <Spin size="small" />
                  ) : avatarPreview || profile?.avatar ? (
                    <img src={avatarPreview || profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CameraOutlined className="text-white text-[20px]" />
                  </div>
                </div>
                <button
                  disabled={avatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-white text-white flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors shadow-md"
                  style={{ border: 'none' }}
                >
                  <CameraOutlined style={{ fontSize: 13 }} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-black text-[#1a1a1a] m-0 leading-tight">{displayName}</p>
                <p className="text-[12px] text-[#aaa] m-0 mt-1">{email}</p>
              </div>
              <p className="text-[11px] text-[#ccc] m-0 text-center">JPG, PNG, WEBP · Tối đa 5MB</p>
            </div>

            {/* Member Rank Card */}
            {/* <div className="rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden relative" style={{ background: rankCfg.bg }}>
              <div className="absolute top-2 right-3 text-[32px] opacity-20">{rankCfg.icon}</div>
              <p className="text-[11px] font-bold text-[#888] uppercase tracking-[0.08em] m-0 mb-1">Hạng thành viên</p>
              <p className="text-[20px] font-black m-0" style={{ color: rankCfg.color }}>{rankCfg.label} {rankCfg.icon}</p>
              {rankCfg.next && (
                <>
                  <div className="mt-3 mb-1.5 h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progress}%`, background: rankCfg.color }}
                    />
                  </div>
                  <p className="text-[11px] text-[#888] m-0">
                    Còn {fmtPrice(Math.max(0, nextSpend - totalSpent))} để lên {rankCfg.next}
                  </p>
                </>
              )}
              <div className="mt-3 pt-3 border-t border-white/30">
                <p className="text-[11px] text-[#888] m-0">Tổng chi tiêu</p>
                <p className="text-[15px] font-black m-0" style={{ color: rankCfg.color }}>{fmtPrice(totalSpent)}</p>
              </div>
            </div> */}

            {/* Navigation */}
            {/* <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              {NAV_ITEMS.map(({ key, label, icon, path }) => {
                const isActive = activeSection === key || (key === 'profile' && activeSection === 'profile');
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (path.startsWith('/profile')) {
                        setActiveSection(key === 'security' ? 'security' : 'profile');
                        if (key === 'security') {
                          setTimeout(() => securityRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      } else {
                        navigate(path);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-[14px] font-medium border-none cursor-pointer transition-all duration-200 text-left border-l-2
                      ${isActive
                        ? 'bg-[#f5f6fa] text-[#1a1a1a] font-semibold border-l-[#1a1a1a]'
                        : 'bg-transparent text-[#888] hover:bg-[#f9f9f9] hover:text-[#1a1a1a] border-l-transparent'
                      }
                    `}
                  >
                    <span className="text-[16px]">{icon}</span>
                    {label}
                  </button>
                );
              })}
              <div className="border-t border-[#f5f5f5]">
                <button
                  onClick={() => { logout(); navigate('/auth'); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-[14px] font-medium text-red-400 hover:bg-red-50 hover:text-red-500 border-none bg-transparent cursor-pointer transition-all duration-200 text-left border-l-2 border-l-transparent"
                >
                  <LogoutOutlined className="text-[16px]" />
                  Đăng xuất
                </button>
              </div>
            </div> */}
          </aside>

          {/* ── RIGHT CONTENT ── */}
          <div className="flex-1 flex flex-col gap-6">

            {/* ── Personal Info Card ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex items-center justify-between px-8 py-5 border-b border-[#f5f5f5]">
                <div>
                  <h2 className="text-[16px] font-black text-[#1a1a1a] m-0">Thông tin cá nhân</h2>
                  <p className="text-[12px] text-[#aaa] m-0 mt-0.5">Cập nhật thông tin hồ sơ của bạn</p>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f6fa] border-none text-[13px] font-semibold text-[#555] cursor-pointer hover:bg-[#1a1a1a] hover:text-white transition-all duration-200"
                  >
                    <EditOutlined /> Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f6fa] border-none text-[13px] font-semibold text-[#888] cursor-pointer hover:bg-[#f0f0f0] transition-all duration-200"
                    >
                      <CloseOutlined /> Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border-none text-[13px] font-semibold text-white cursor-pointer hover:bg-[#333] transition-all duration-200 disabled:opacity-60"
                    >
                      {saving ? <Spin size="small" /> : <SaveOutlined />}
                      Lưu thay đổi
                    </button>
                  </div>
                )}
              </div>

              <div className="px-8 py-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <InputField
                    label="Họ và tên"
                    id="fullName"
                    icon={<UserOutlined />}
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    disabled={!editing}
                    hint={editing ? 'Họ tên hiển thị trên đơn hàng và hóa đơn của bạn' : undefined}
                  />

                  {/* Email */}
                  <InputField
                    label="Email"
                    id="email"
                    icon={<MailOutlined />}
                    value={email}
                    disabled
                    badge={
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircleOutlined /> Đã xác thực
                      </span>
                    }
                    hint="Email không thể thay đổi"
                  />

                  {/* Phone */}
                  <InputField
                    label="Số điện thoại"
                    id="phone"
                    icon={<PhoneOutlined />}
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    disabled={!editing}
                    suffix={
                      form.phone ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                          <SafetyOutlined /> Tin cậy
                        </span>
                      ) : null
                    }
                  />

                  {/* Date of Birth */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="dob" className="text-[12px] font-bold text-[#888] uppercase tracking-[0.06em]">Ngày sinh</label>
                    <div className="relative">
                      <DatePicker
                        id="dob"
                        format="DD/MM/YYYY"
                        value={form.dob ? dayjs(form.dob, 'YYYY-MM-DD') : null}
                        onChange={(date) => setForm(f => ({ ...f, dob: date ? date.format('YYYY-MM-DD') : '' }))}
                        disabled={!editing}
                        placeholder="Chọn ngày sinh"
                        size="large"
                        className="w-full"
                        style={{
                          borderRadius: 12,
                          borderColor: editing ? '#e5e5e5' : '#f0f0f0',
                          backgroundColor: editing ? '#fff' : '#f8f8f8',
                        }}
                        allowClear={editing}
                        suffixIcon={<CalendarOutlined style={{ color: '#bbb' }} />}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#888] uppercase tracking-[0.06em]">Giới tính</label>
                    <div className="flex gap-3">
                      {[
                        { value: 'male',   label: 'Nam',   icon: <ManOutlined /> },
                        { value: 'female', label: 'Nữ',    icon: <WomanOutlined /> },
                        { value: 'other',  label: 'Khác',  icon: <UserOutlined /> },
                      ].map(({ value, label, icon }) => (
                        <button
                          key={value}
                          type="button"
                          disabled={!editing}
                          onClick={() => setForm(f => ({ ...f, gender: value }))}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-200
                            ${form.gender === value
                              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                              : 'bg-white text-[#888] border-[#e5e5e5] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                            }
                            ${!editing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                          `}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Linked Accounts Card ── */}
            {/* <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="px-8 py-5 border-b border-[#f5f5f5]">
                <h2 className="text-[16px] font-black text-[#1a1a1a] m-0">Liên kết tài khoản</h2>
                <p className="text-[12px] text-[#aaa] m-0 mt-0.5">Kết nối tài khoản mạng xã hội để đăng nhập nhanh hơn</p>
              </div>
              <div className="px-8 py-6 flex flex-col gap-4"> */}
                {/* Google */}
                {/* <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#f0f0f0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <GoogleOutlined style={{ fontSize: 20, color: '#ea4335' }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a1a] m-0">Google</p>
                      <p className="text-[12px] text-[#aaa] m-0">
                        {profile?.googleId ? 'Đã liên kết · ' + email : 'Chưa liên kết'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => message.info('Chức năng đang phát triển')}
                    className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold border cursor-pointer transition-all duration-200
                      ${profile?.googleId
                        ? 'bg-white border-[#e5e5e5] text-[#888] hover:border-red-400 hover:text-red-500'
                        : 'bg-[#1a1a1a] border-[#1a1a1a] text-white hover:bg-[#333]'
                      }
                    `}
                  >
                    {profile?.googleId ? 'Hủy liên kết' : 'Liên kết'}
                  </button>
                </div> */}

                {/* Facebook */}
                {/* <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#f0f0f0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1877f2] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a1a] m-0">Facebook</p>
                      <p className="text-[12px] text-[#aaa] m-0">Chưa liên kết</p>
                    </div>
                  </div>
                  <button
                    onClick={() => message.info('Chức năng đang phát triển')}
                    className="px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-[#1a1a1a] border border-[#1a1a1a] text-white hover:bg-[#333] cursor-pointer transition-all duration-200"
                  >
                    Liên kết
                  </button>
                </div>
              </div>
            </div> */}

            {/* ── Security Section ── */}
            <div ref={securityRef} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden scroll-mt-8">
              <div className="px-8 py-5 border-b border-[#f5f5f5]">
                <h2 className="text-[16px] font-black text-[#1a1a1a] m-0">Bảo mật</h2>
                <p className="text-[12px] text-[#aaa] m-0 mt-0.5">Bảo vệ tài khoản của bạn</p>
              </div>
              <div className="px-8 py-7 flex flex-col gap-7">
                {/* Change Password */}
                <div>
                  <h3 className="text-[14px] font-bold text-[#1a1a1a] m-0 mb-4 flex items-center gap-2">
                    <LockOutlined /> Đổi mật khẩu
                  </h3>
                  <div className="flex flex-col gap-4 max-w-[480px]">
                    <PasswordField
                      label="Mật khẩu hiện tại"
                      id="currentPw"
                      value={pwForm.current}
                      onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <PasswordField
                      label="Mật khẩu mới"
                      id="newPw"
                      value={pwForm.next}
                      onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <PasswordField
                      label="Xác nhận mật khẩu mới"
                      id="confirmPw"
                      value={pwForm.confirm}
                      onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      onClick={handleChangePassword}
                      disabled={pwLoading}
                      className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-[#333] transition-all duration-200 disabled:opacity-60"
                    >
                      {pwLoading ? <Spin size="small" /> : <LockOutlined />}
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#f5f5f5]" />

                {/* 2FA Toggle */}
                {/* <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1a1a1a] m-0 flex items-center gap-2">
                      <SafetyOutlined /> Xác thực 2 bước (2FA)
                    </h3>
                    <p className="text-[12px] text-[#aaa] m-0 mt-1">
                      Thêm lớp bảo vệ cho tài khoản bằng OTP qua email
                    </p>
                  </div>
                  <button
                    onClick={() => { setTwoFA(v => !v); message.info('Chức năng đang phát triển'); }}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 border-none cursor-pointer flex-shrink-0
                      ${twoFA ? 'bg-[#1a1a1a]' : 'bg-[#e5e5e5]'}
                    `}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${twoFA ? 'left-6' : 'left-0.5'}`}
                    />
                  </button>
                </div> */}
              </div>
            </div>

            {/* ── Privacy / Delete Account ── */}
            {/* <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden border border-red-100">
              <div className="px-8 py-5 border-b border-red-50">
                <h2 className="text-[16px] font-black text-red-500 m-0">Quyền riêng tư & Dữ liệu</h2>
                <p className="text-[12px] text-[#aaa] m-0 mt-0.5">Kiểm soát dữ liệu cá nhân của bạn</p>
              </div>
              <div className="px-8 py-6 flex flex-col gap-3">
                <button
                  onClick={() => message.info('Chức năng tải dữ liệu đang được phát triển')}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#f8f9fa] border border-[#f0f0f0] text-[14px] font-semibold text-[#555] cursor-pointer hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all duration-200 text-left"
                >
                  <StarOutlined className="text-[16px]" />
                  <div>
                    <p className="m-0">Tải xuống dữ liệu của tôi</p>
                    <p className="text-[11px] text-[#bbb] m-0 font-normal">Nhận bản sao dữ liệu cá nhân theo chuẩn GDPR</p>
                  </div>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-red-50 border border-red-100 text-[14px] font-semibold text-red-500 cursor-pointer hover:bg-red-100 hover:border-red-300 transition-all duration-200 text-left"
                >
                  <DeleteOutlined className="text-[16px]" />
                  <div>
                    <p className="m-0">Xóa tài khoản vĩnh viễn</p>
                    <p className="text-[11px] text-red-300 m-0 font-normal">Hành động này không thể hoàn tác</p>
                  </div>
                </button>
              </div>
            </div> */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
