// ============================================================
// MyOrdersPage — Danh sách đơn hàng của người dùng
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Spin, Empty, Pagination, message, Select } from 'antd';
import { FileTextOutlined, LoadingOutlined } from '@ant-design/icons';
import { fetchMyOrders, fetchOrderById, cancelOrder } from '../../api/orderService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrderCard from './components/OrderCard';
import OrderDetailModal from './components/OrderDetailModal';

const { Option } = Select;

const STATUS_FILTERS = [
  { value: '',          label: 'Tất Cả' },
  { value: 'pending',   label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping',  label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const MyOrdersPage = () => {
  const { isLoggedIn } = useAuth();
  const navigate       = useNavigate();

  const [orders,   setOrders]   = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [pageSize] = useState(8);
  const [filter,   setFilter]   = useState('');

  // Detail modal
  const [detailOrder,   setDetailOrder]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen,     setModalOpen]     = useState(false);

  useEffect(() => {
    if (!isLoggedIn) navigate('/auth');
  }, [isLoggedIn, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (filter) params.orderStatus = filter;
      const data = await fetchMyOrders(params);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter]);

  useEffect(() => { load(); }, [load]);

  const handleViewDetail = async (order) => {
    setModalOpen(true);
    setDetailOrder(order);
    // Fetch full detail (có populated product)
    try {
      setDetailLoading(true);
      const full = await fetchOrderById(order._id);
      setDetailOrder(full);
    } catch {
      // Use the existing order data
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId, 'Người dùng hủy đơn');
      message.success('Đã hủy đơn hàng');
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header */}
      <div className="bg-white border-b border-[#f0f0f0]">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FileTextOutlined style={{ fontSize: 28, color: '#1a1a1a' }} />
              <div>
                <h1 className="text-[28px] font-black text-[#1a1a1a] m-0 tracking-[-0.02em] mt-2">
                  Đơn Hàng Của Tôi
                </h1>
                {/* <p className="text-[13px] text-[#888] m-0">Quản lý và theo dõi đơn hàng</p> */}
              </div>
            </div>

            {/* Filter */}
            <Select
              value={filter || undefined}
              onChange={(v) => { setFilter(v || ''); setPage(1); }}
              placeholder="Lọc theo trạng thái"
              size="large"
              allowClear
              style={{ width: 200 }}
            >
              {STATUS_FILTERS.slice(1).map(({ value, label }) => (
                <Option key={value} value={value}>{label}</Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} />} />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm py-20">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-[#888] text-[14px]">
                  {filter ? 'Không có đơn hàng nào trong trạng thái này' : 'Bạn chưa có đơn hàng nào'}
                </span>
              }
            >
              <a
                href="/products"
                className="h-10 px-6 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-lg inline-flex items-center hover:bg-[#333] transition-colors no-underline"
              >
                Mua Sắm Ngay
              </a>
            </Empty>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-8">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>

            {total > pageSize && (
              <div className="flex justify-center">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={pageSize}
                  onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  showSizeChanger={false}
                  // showQuickJumper
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        order={detailOrder}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default MyOrdersPage;
