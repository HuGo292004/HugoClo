// ============================================================
// LoginForm — Email/password login form (Tailwind CSS)
// ============================================================

import React, { useState } from 'react';
import { Checkbox, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SocialLoginButtons from './SocialLoginButtons';
import { useAuth } from '../../../context/AuthContext';

const LoginForm = ({ onSwitchToRegister }) => {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [remember,    setRemember]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});

  const { login } = useAuth();
  const navigate  = useNavigate();

  const validate = () => {
    const e = {};
    if (!email)                  e.email    = 'Vui lòng nhập email.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email không hợp lệ.';
    if (!password)               e.password = 'Vui lòng nhập mật khẩu.';
    else if (password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const { user } = await login({ email, password });
      message.success(`Chào mừng trở lại, ${user.fullName}`);
      const redirectUrl = localStorage.getItem('redirect_after_login') || '/';
      navigate(redirectUrl);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="animate-fade-in-up">
      {/* Title */}
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] mb-1.5 tracking-[-0.01em]">
          Chào Mừng Trở Lại
        </h1>
        <p className="text-[14px] text-[#888]">Đăng nhập để tiếp tục mua sắm</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Email */}
        <FloatingField
          id="login-email"
          label="Địa chỉ Email"
          type="email"
          value={email}
          onChange={setEmail}
          icon={<MailOutlined />}
          error={errors.email}
          autoComplete="email"
        />

        {/* Password */}
        <FloatingField
          id="login-password"
          label="Mật khẩu"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          icon={<LockOutlined />}
          error={errors.password}
          autoComplete="current-password"
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

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <Checkbox
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="text-[13px] text-[#555]"
          >
            Ghi nhớ đăng nhập
          </Checkbox>
          <a href="#" className="text-[13px] font-semibold text-[#1a1a1a] no-underline hover:underline">
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] bg-[#1a1a1a] text-white text-[14px] font-bold tracking-[0.06em] rounded-lg border-none cursor-pointer transition-all duration-250 hover:bg-[#333] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              Đang xử lý...
            </span>
          ) : 'ĐĂNG NHẬP'}
        </button>
      </form>

      {/* Divider */}
      <Divider />

      {/* Social */}
      <SocialLoginButtons />

      {/* Switch to Register */}
      <p className="text-center text-[13px] text-[#888] mt-6 mb-0">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[#1a1a1a] font-bold no-underline hover:underline bg-transparent border-none cursor-pointer p-0 text-[13px]"
        >
          Đăng Ký Ngay
        </button>
      </p>
    </div>
  );
};

/* ── Shared sub-components ── */

export const FloatingField = ({ id, label, type = 'text', value, onChange, icon, error, suffix, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={`relative flex items-center border rounded-lg transition-all duration-200 bg-white ${
          error
            ? 'border-[#e63946] shadow-[0_0_0_3px_rgba(230,57,70,0.1)]'
            : focused
            ? 'border-[#1a1a1a] shadow-[0_0_0_3px_rgba(26,26,26,0.08)]'
            : 'border-[#e0e0e0] hover:border-[#c5c5c5]'
        }`}
      >
        {/* Leading icon */}
        <span className="pl-4 text-[16px] text-[#bbb] shrink-0 flex items-center">{icon}</span>

        {/* Input */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          className="flex-1 h-[54px] px-3 pt-5 pb-1 bg-transparent border-none outline-none text-[14px] text-[#1a1a1a] font-medium placeholder-transparent peer"
          placeholder={label}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {/* Floating label */}
        <label
          htmlFor={id}
          className={`absolute left-11 transition-all duration-200 pointer-events-none font-medium ${
            isActive
              ? 'text-[10px] top-2 text-[#888] tracking-[0.06em] uppercase'
              : 'text-[14px] top-1/2 -translate-y-1/2 text-[#aaa]'
          }`}
        >
          {label}
        </label>

        {/* Trailing icon/action */}
        {suffix && <span className="pr-4 shrink-0 flex items-center">{suffix}</span>}
      </div>

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-[12px] text-[#e63946] mt-1.5 ml-1 m-0" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export const Divider = () => (
  <div className="flex items-center gap-3 my-6">
    <div className="flex-1 h-px bg-[#e5e5e5]" />
    <span className="text-[12px] text-[#bbb] font-medium tracking-[0.06em] uppercase shrink-0">Hoặc</span>
    <div className="flex-1 h-px bg-[#e5e5e5]" />
  </div>
);

export default LoginForm;
