// ============================================================
// NewsletterSection — Email signup, dark bg (Tailwind CSS)
// ============================================================

import React, { useState } from 'react';
import { Input, message } from 'antd';
import { MailOutlined, ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';

const NewsletterSection = () => {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      message.warning('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      message.success('Đăng ký thành công! Kiểm tra email để nhận ưu đãi.');
    }, 1200);
  };

  return (
    <section className="bg-primary section-py relative overflow-hidden" aria-label="Đăng ký nhận ưu đãi">
      {/* Deco circles */}
      <div className="absolute top-[-80px] left-[-120px] w-80 h-80 rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-120px] w-80 h-80 rounded-full bg-[#d4af37]/[0.06] pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-[680px] mx-auto text-center">

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-white/8 border border-white/12 flex items-center justify-center mx-auto mb-7 text-[28px] text-[#d4af37]">
            <MailOutlined />
          </div>

          {/* Title */}
          <h2 className="text-[40px] font-black text-white mb-3.5 tracking-[-0.02em]">
            Đăng Ký Nhận Ưu Đãi
          </h2>
          <p className="text-[17px] text-white/65 leading-7 mb-9">
            Nhận ngay{' '}
            <strong className="text-[#d4af37] font-bold">giảm 10%</strong>{' '}
            cho đơn hàng đầu tiên và cập nhật bộ sưu tập mới nhất.
          </p>

          {/* Form or success */}
          {submitted ? (
            <div className="bg-[#2d6a4f]/20 border border-[#2d6a4f]/40 rounded-lg px-7 py-5 flex items-center justify-center gap-3 text-[#a8e6cf] text-[16px] font-medium mb-5">
              <CheckCircleFilled className="text-[24px] text-[#52c41a] shrink-0" />
              <span>Cảm ơn bạn đã đăng ký! Hãy kiểm tra email của bạn.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mb-5" noValidate>
              <div className="flex rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn..."
                  prefix={<MailOutlined className="text-[#888]" />}
                  size="large"
                  autoComplete="email"
                  aria-label="Địa chỉ email"
                  className="flex-1 text-[15px]! border-none! rounded-none! h-14! bg-white/95!"
                  style={{ borderRadius: 0, border: 'none' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 px-8 bg-[#d4af37] text-primary text-[14px] font-bold tracking-[0.06em] border-none cursor-pointer shrink-0 flex items-center gap-2 transition-colors duration-200 hover:bg-[#c9a227] disabled:opacity-60"
                >
                  {loading ? '...' : (<>Đăng Ký <ArrowRightOutlined /></>)}
                </button>
              </div>
            </form>
          )}

          {/* Disclaimer */}
          <p className="text-[12px] text-white/35 leading-7">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất kỳ lúc nào.
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <a href="#" className="text-white/55 underline hover:text-white/85 transition-colors">Điều khoản</a>
            {' '}và{' '}
            <a href="#" className="text-white/55 underline hover:text-white/85 transition-colors">Chính sách Bảo mật</a>.
          </p>

        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
