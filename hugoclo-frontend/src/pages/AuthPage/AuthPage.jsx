// ============================================================
// AuthPage — Login & Register split-screen page (Tailwind CSS)
// ============================================================

import React, { useState } from 'react';
import AuthHeader from './components/AuthHeader';
import AuthBenefitsStrip from './components/AuthBenefitsStrip';
import AuthFooter from './components/AuthFooter';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import authLifestyle from '../../assets/auth_lifestyle.png';
import logo from '../../assets/hugoclo_logo.png';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
      <AuthHeader />

      {/* ── Main Split Layout ── */}
      <main className="flex flex-1" role="main" id="main-content">

        {/* Left — Auth Card Panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Card */}
          <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.12)] overflow-hidden">

            {/* Tab Toggle */}
            <div className="flex border-b border-[#e5e5e5]">
              <TabBtn
                active={activeTab === 'login'}
                onClick={() => setActiveTab('login')}
              >
                ĐĂNG NHẬP
              </TabBtn>
              <TabBtn
                active={activeTab === 'register'}
                onClick={() => setActiveTab('register')}
              >
                ĐĂNG KÝ
              </TabBtn>
            </div>

            {/* Form Area */}
            <div className="p-8 md:p-10">
              {activeTab === 'login' ? (
                <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
              )}
            </div>
          </div>

          {/* Benefits Strip */}
          <AuthBenefitsStrip />
        </div>

        {/* Right — Lifestyle Image Panel (hidden on mobile) */}
        <div className="hidden lg:flex flex-[0_0_50%] relative overflow-hidden">
          {/* Background image */}
          <img
            src={authLifestyle}
            alt="HugoClo Fashion Lifestyle"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Top watermark logo */}
          <div className="absolute top-8 right-8 flex items-center gap-2 z-10">
            <img
              src={logo}
              alt="HugoClo"
              className="h-8 w-auto brightness-0 invert opacity-80"
            />
            <span className="text-white/80 font-black text-[16px] tracking-[0.08em]">HUGOCLO</span>
          </div>

          {/* Bottom quote */}
          <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
            <blockquote className="text-white">
              <p className="text-[26px] font-bold leading-[1.3] mb-4 tracking-[-0.01em]">
                "Fashion is the armor to survive everyday life."
              </p>
              <footer className="text-white/60 text-[14px] font-medium tracking-[0.06em] uppercase">
                — Bill Cunningham
              </footer>
            </blockquote>

            {/* Decorative tag chips */}
            <div className="flex gap-2 mt-6 flex-wrap">
              {['#TốiGiản', '#ChấtLượng', '#HienĐại'].map((tag) => (
                <span
                  key={tag}
                  className="bg-white/15 backdrop-blur-sm border border-white/20 text-white/80 text-[12px] px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </main>

      <AuthFooter />
    </div>
  );
};

/* ── Tab Button ── */
const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 text-[13px] font-bold tracking-[0.1em] border-none bg-transparent cursor-pointer transition-all duration-200 relative ${
      active
        ? 'text-[#1a1a1a]'
        : 'text-[#999] hover:text-[#555]'
    }`}
  >
    {children}
    {/* Underline indicator */}
    <span
      className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#1a1a1a] transition-all duration-300 ${
        active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
      }`}
    />
  </button>
);

export default AuthPage;
