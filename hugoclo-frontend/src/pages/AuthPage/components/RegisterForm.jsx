// ============================================================
// RegisterForm — Full registration form with strength indicator
// ============================================================

import React, { useState } from 'react';
import { Checkbox, message } from 'antd';
import {
  EyeOutlined, EyeInvisibleOutlined,
  UserOutlined, MailOutlined,
  LockOutlined, PhoneOutlined,
} from '@ant-design/icons';
import { FloatingField, Divider } from './LoginForm';
import SocialLoginButtons from './SocialLoginButtons';

/* ── Password strength logic ── */
const getStrength = (pass) => {
  let score = 0;
  if (!pass) return { score: 0, label: '', color: '' };
  if (pass.length >= 6)  score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass))   score++;
  if (/[0-9]/.test(pass))   score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score, label: 'Rất yếu',  color: '#e63946' };
  if (score === 2) return { score, label: 'Yếu',     color: '#f4a261' };
  if (score === 3) return { score, label: 'Trung bình', color: '#e9c46a' };
  if (score === 4) return { score, label: 'Mạnh',    color: '#52b788' };
  return             { score, label: 'Rất mạnh', color: '#2d6a4f' };
};

const PasswordStrengthBar = ({ password }) => {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? color : '#e5e5e5' }}
          />
        ))}
      </div>
      <p className="text-[11px] font-semibold m-0" style={{ color }}>
        Độ mạnh mật khẩu: {label}
      </p>
    </div>
  );
};

/* ── Main Component ── */
const RegisterForm = ({ onSwitchToLogin }) => {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phone: '',
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed,      setAgreed]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});

  const setField = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())    e.fullName        = 'Vui lòng nhập họ và tên.';
    if (!form.email)              e.email           = 'Vui lòng nhập email.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ.';
    if (!form.password)           e.password        = 'Vui lòng nhập mật khẩu.';
    else if (form.password.length < 6) e.password   = 'Mật khẩu ít nhất 6 ký tự.';
    if (!form.confirmPassword)    e.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    if (form.phone && !/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Số điện thoại không hợp lệ.';
    if (!agreed) e.agreed = 'Vui lòng đồng ý với điều khoản.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Đăng ký thành công! Chào mừng bạn đến với HugoClo 🎉');
    }, 1500);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Title */}
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] mb-1.5 tracking-[-0.01em]">
          Tạo Tài Khoản
        </h1>
        <p className="text-[14px] text-[#888]">Tham gia HugoClo và nhận ưu đãi ngay hôm nay</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {/* Full Name */}
        <FloatingField
          id="reg-fullname"
          label="Họ và Tên"
          type="text"
          value={form.fullName}
          onChange={setField('fullName')}
          icon={<UserOutlined />}
          error={errors.fullName}
          autoComplete="name"
        />

        {/* Email */}
        <FloatingField
          id="reg-email"
          label="Địa chỉ Email"
          type="email"
          value={form.email}
          onChange={setField('email')}
          icon={<MailOutlined />}
          error={errors.email}
          autoComplete="email"
        />

        {/* Password + strength bar */}
        <div>
          <FloatingField
            id="reg-password"
            label="Mật khẩu"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={setField('password')}
            icon={<LockOutlined />}
            error={errors.password}
            autoComplete="new-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="text-[#999] hover:text-[#555] bg-transparent border-none cursor-pointer p-0 flex items-center"
                aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPass ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            }
          />
          <PasswordStrengthBar password={form.password} />
        </div>

        {/* Confirm Password */}
        <FloatingField
          id="reg-confirm-password"
          label="Xác nhận Mật khẩu"
          type={showConfirm ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={setField('confirmPassword')}
          icon={<LockOutlined />}
          error={errors.confirmPassword}
          autoComplete="new-password"
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="text-[#999] hover:text-[#555] bg-transparent border-none cursor-pointer p-0 flex items-center"
              aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirm ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          }
        />

        {/* Phone (optional) */}
        <FloatingField
          id="reg-phone"
          label="Số điện thoại (không bắt buộc)"
          type="tel"
          value={form.phone}
          onChange={setField('phone')}
          icon={<PhoneOutlined />}
          error={errors.phone}
          autoComplete="tel"
        />

        {/* Terms */}
        <div>
          <Checkbox
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setErrors((er) => ({ ...er, agreed: undefined }));
            }}
            className="text-[13px] text-[#555] items-start"
          >
            Tôi đồng ý với{' '}
            <a href="#" className="text-[#1a1a1a] font-semibold hover:underline no-underline">
              Điều Khoản Dịch Vụ
            </a>{' '}
            &{' '}
            <a href="#" className="text-[#1a1a1a] font-semibold hover:underline no-underline">
              Chính Sách Bảo Mật
            </a>
          </Checkbox>
          {errors.agreed && (
            <p className="text-[12px] text-[#e63946] mt-1.5 ml-6 m-0" role="alert">
              {errors.agreed}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] bg-[#1a1a1a] text-white text-[14px] font-bold tracking-[0.06em] rounded-lg border-none cursor-pointer transition-all duration-250 hover:bg-[#333] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mt-1"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              Đang xử lý...
            </span>
          ) : 'ĐĂNG KÝ'}
        </button>
      </form>

      {/* Divider */}
      <Divider />

      {/* Social */}
      <SocialLoginButtons />

      {/* Switch to Login */}
      <p className="text-center text-[13px] text-[#888] mt-6 mb-0">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#1a1a1a] font-bold no-underline hover:underline bg-transparent border-none cursor-pointer p-0 text-[13px]"
        >
          Đăng Nhập
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
