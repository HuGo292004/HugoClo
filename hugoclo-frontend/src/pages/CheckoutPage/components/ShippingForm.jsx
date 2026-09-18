// ============================================================
// ShippingForm — Bước 2: Nhập thông tin giao hàng
// ============================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserOutlined, PhoneOutlined, HomeOutlined, EnvironmentOutlined, TruckOutlined } from '@ant-design/icons';

const Field = ({ label, icon, error, children }) => (
  <div>
    <label className="block text-[12px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className={`flex items-center border rounded-xl bg-white transition-all ${error ? 'border-red-400' : 'border-[#e5e5e5] focus-within:border-[#1a1a1a]'}`}>
      {icon && <span className="pl-4 text-[#bbb] text-[15px] shrink-0">{icon}</span>}
      {children}
    </div>
    {error && <p className="text-[11px] text-red-500 mt-1 m-0">{error}</p>}
  </div>
);

const inputCls = "flex-1 h-[48px] px-4 bg-transparent border-none outline-none text-[14px] text-[#1a1a1a] font-medium placeholder-[#bbb]";

const ShippingForm = ({ values, onChange, errors }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch all provinces, districts, and wards
    axios.get('https://provinces.open-api.vn/api/?depth=3')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load provinces:', err));
  }, []);

  const set = (field) => (e) => onChange({ ...values, [field]: e.target.value });

  const provinces = data;
  const selectedProvince = data.find(p => p.name === values.city);
  const districts = selectedProvince ? selectedProvince.districts : [];
  const selectedDistrict = districts.find(d => d.name === values.district);
  const wards = selectedDistrict ? selectedDistrict.wards : [];

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-[18px] font-bold text-[#1a1a1a] m-0 pb-3 border-b border-[#f0f0f0]">
        <TruckOutlined className="mr-1"/> Thông Tin Giao Hàng
      </h3>

      {/* Họ tên */}
      <Field label="Họ và Tên *" icon={<UserOutlined />} error={errors?.fullName}>
        <input
          className={inputCls}
          placeholder="Nguyễn Văn A"
          value={values.fullName}
          onChange={set('fullName')}
        />
      </Field>

      {/* Số điện thoại */}
      <Field label="Số Điện Thoại *" icon={<PhoneOutlined />} error={errors?.phone}>
        <input
          className={inputCls}
          placeholder="0901 234 567"
          value={values.phone}
          onChange={set('phone')}
          type="tel"
        />
      </Field>

      {/* Tỉnh thành / Quận huyện */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tỉnh / Thành Phố *" icon={<EnvironmentOutlined />} error={errors?.city}>
          <select
            className="flex-1 h-[48px] px-4 bg-transparent border-none outline-none text-[14px] text-[#1a1a1a] font-medium appearance-none cursor-pointer"
            value={values.city}
            onChange={(e) => {
              onChange({ ...values, city: e.target.value, district: '', ward: '' });
            }}
          >
            <option value="">Chọn tỉnh / thành phố</option>
            {provinces.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
          </select>
        </Field>

        <Field label="Quận / Huyện *" error={errors?.district}>
          <select
            className="flex-1 h-[48px] px-4 bg-transparent border-none outline-none text-[14px] text-[#1a1a1a] font-medium appearance-none cursor-pointer disabled:opacity-50"
            value={values.district}
            onChange={(e) => {
              onChange({ ...values, district: e.target.value, ward: '' });
            }}
            disabled={!districts.length}
          >
            <option value="">Chọn quận / huyện</option>
            {districts.map((d) => <option key={d.code} value={d.name}>{d.name}</option>)}
          </select>
        </Field>
      </div>

      {/* Phường / Xã */}
      <Field label="Phường / Xã" error={errors?.ward}>
        <select
          className="flex-1 h-[48px] px-4 bg-transparent border-none outline-none text-[14px] text-[#1a1a1a] font-medium appearance-none cursor-pointer disabled:opacity-50"
          value={values.ward}
          onChange={set('ward')}
          disabled={!wards.length}
        >
          <option value="">Chọn phường / xã</option>
          {wards.map((w) => <option key={w.code} value={w.name}>{w.name}</option>)}
        </select>
      </Field>

      {/* Địa chỉ */}
      <Field label="Địa Chỉ (Số nhà, Tên đường) *" icon={<HomeOutlined />} error={errors?.address}>
        <input
          className={inputCls}
          placeholder="123 Đường Lê Lợi"
          value={values.address}
          onChange={set('address')}
        />
      </Field>

      {/* Ghi chú */}
      <div>
        <label className="block text-[12px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">
          Ghi Chú Cho Shipper
        </label>
        <textarea
          className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-[14px] text-[#1a1a1a] placeholder-[#bbb] outline-none resize-none focus:border-[#1a1a1a] transition-all bg-white"
          rows={3}
          placeholder="VD: Gọi trước 30 phút, giao giờ hành chính..."
          value={values.note}
          onChange={set('note')}
        />
      </div>
    </div>
  );
};

export default ShippingForm;
