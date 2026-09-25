// ============================================================
// AdminOrdersPage — Quản lý đơn hàng (Admin)
// Route: /admin/orders (protected, admin only)
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Tag, Input, Select, DatePicker, Modal, message,
  Tooltip, Badge, Spin, Empty, Drawer, Descriptions, Divider,
} from 'antd';
import {
  SearchOutlined, FilterOutlined, ReloadOutlined,
  ShoppingCartOutlined, ClockCircleOutlined, CarOutlined,
  CheckCircleOutlined, CloseCircleOutlined, DollarOutlined,
  EyeOutlined, EditOutlined, DownloadOutlined, WarningOutlined,
  UserOutlined, PhoneOutlined, EnvironmentOutlined, PrinterOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/orderService';
import AdminLayout from './AdminLayout';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// ── Helpers ────────────────────────────────────────────────────
const fmtPrice = (n) =>
  n?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0₫';

const fmtDate = (d) => dayjs(d).format('DD/MM/YYYY HH:mm');

// ── Order Status Config ────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', icon: <ClockCircleOutlined />,   antTag: 'warning'  },
  confirmed: { label: 'Đang xử lý',   color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', icon: <ShoppingCartOutlined />,  antTag: 'processing'},
  shipping:  { label: 'Đang giao',    color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', icon: <CarOutlined />,            antTag: 'default'  },
  delivered: { label: 'Hoàn thành',   color: '#22c55e', bg: '#f0fdf4', border: '#86efac', icon: <CheckCircleOutlined />,   antTag: 'success'  },
  cancelled: { label: 'Đã hủy',       color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', icon: <CloseCircleOutlined />,   antTag: 'error'    },
};

const PAYMENT_CONFIG = {
  cod:   { label: 'COD',   color: '#78716c', bg: '#f5f5f4' },
  vnpay: { label: 'VNPay', color: '#0369a1', bg: '#e0f2fe' },
  momo:  { label: 'MoMo',  color: '#be185d', bg: '#fdf2f8' },
};

const PAYMENT_STATUS_CONFIG = {
  pending:  { label: 'Chưa thanh toán', color: '#f59e0b' },
  paid:     { label: 'Đã thanh toán',   color: '#22c55e' },
  failed:   { label: 'Thất bại',        color: '#ef4444' },
  refunded: { label: 'Đã hoàn tiền',    color: '#8b5cf6' },
};

// Luồng trạng thái tiếp theo được phép
const NEXT_STATUSES = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping:  ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

// ── Stat Card ──────────────────────────────────────────────────
const MetricCard = ({ title, value, sub, icon, accentColor, badge }) => (
  <div
    className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col gap-3 relative overflow-hidden"
    style={{ borderLeft: `4px solid ${accentColor}` }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] m-0 mb-2">
          {title}
        </p>
        <p className="text-[26px] font-black text-[#1a1a1a] m-0 leading-none">{value}</p>
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px] flex-shrink-0 ml-2"
        style={{ background: `${accentColor}18`, color: accentColor }}
      >
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {badge && (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          {badge}
        </span>
      )}
      {sub && <span className="text-[12px] text-[#bbb]">{sub}</span>}
    </div>
  </div>
);

// ── Status Badge ───────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ── Payment Badge ──────────────────────────────────────────────
const PaymentBadge = ({ method }) => {
  const cfg = PAYMENT_CONFIG[method] || PAYMENT_CONFIG.cod;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
};

// ── Order Detail Drawer ────────────────────────────────────────
const OrderDetailDrawer = ({ order, open, onClose, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [pendingStatus, setPendingStatus] = useState(null);

  if (!order) return null;

  const nextStatuses = NEXT_STATUSES[order.orderStatus] || [];

  const handleChangeStatus = async (newStatus) => {
    if (newStatus === 'cancelled') {
      setPendingStatus(newStatus);
      setCancelModalOpen(true);
      return;
    }
    setUpdating(true);
    try {
      await updateOrderStatusAdmin(order._id, newStatus);
      message.success(`Đã cập nhật trạng thái → ${STATUS_CONFIG[newStatus]?.label}`);
      onStatusChange();
      onClose();
    } catch {
      message.error('Cập nhật thất bại, vui lòng thử lại');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      message.warning('Vui lòng nhập lý do hủy');
      return;
    }
    setUpdating(true);
    try {
      await updateOrderStatusAdmin(order._id, 'cancelled', cancelReason);
      message.success('Đã hủy đơn hàng');
      setCancelModalOpen(false);
      onStatusChange();
      onClose();
    } catch {
      message.error('Hủy đơn thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const addr = order.shippingAddress;
  const shortId = order._id?.slice(-8).toUpperCase();

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider m-0">Chi tiết đơn hàng</p>
              <p className="text-[18px] font-black text-[#1a1a1a] m-0">#{shortId}</p>
            </div>
            <StatusBadge status={order.orderStatus} />
          </div>
        }
        placement="right"
        width={600}
        open={open}
        onClose={onClose}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Spin spinning={updating}>
          {/* Customer Info */}
          <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider m-0 mb-3">
              <UserOutlined className="mr-1" />Thông tin khách hàng
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-[#aaa] m-0">Tên khách hàng</p>
                <p className="text-[13px] font-semibold text-[#1a1a1a] m-0 mt-0.5">
                  {addr?.fullName || order.user?.fullName || '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#aaa] m-0">Số điện thoại</p>
                <p className="text-[13px] font-semibold text-[#1a1a1a] m-0 mt-0.5">
                  <PhoneOutlined className="mr-1" />{addr?.phone || '—'}
                </p>
              </div>
              {order.user?.email && (
                <div className="col-span-2">
                  <p className="text-[11px] text-[#aaa] m-0">Email</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a] m-0 mt-0.5">{order.user.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider m-0 mb-3">
              <EnvironmentOutlined className="mr-1" />Địa chỉ giao hàng
            </p>
            <p className="text-[13px] text-[#333] m-0 leading-relaxed">
              {[addr?.address, addr?.ward, addr?.district, addr?.city].filter(Boolean).join(', ')}
            </p>
            {addr?.note && (
              <p className="text-[12px] text-[#888] m-0 mt-2 italic">Ghi chú: {addr.note}</p>
            )}
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider m-0 mb-3">
              Sản phẩm đã đặt ({order.items?.length || 0} loại)
            </p>
            <div className="flex flex-col gap-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-xl">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#e5e5e5] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#e5e5e5] flex items-center justify-center flex-shrink-0">
                      <ShoppingCartOutlined style={{ color: '#aaa', fontSize: 18 }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1a1a] m-0 truncate">{item.name}</p>
                    <p className="text-[12px] text-[#888] m-0">
                      {fmtPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-[#1a1a1a] m-0 whitespace-nowrap">
                    {fmtPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4 text-white">
            <div className="flex justify-between mb-2">
              <span className="text-[12px] text-white/60">Tạm tính</span>
              <span className="text-[13px] font-semibold">{fmtPrice(order.subtotal)}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-[12px] text-white/60">Phí vận chuyển</span>
                <span className="text-[13px] font-semibold">{fmtPrice(order.shippingFee)}</span>
              </div>
            )}
            {order.discountAmt > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-[12px] text-white/60">Giảm giá {order.couponCode && `(${order.couponCode})`}</span>
                <span className="text-[13px] font-semibold text-green-400">-{fmtPrice(order.discountAmt)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
              <span className="text-[13px] font-bold">Tổng cộng</span>
              <span className="text-[16px] font-black">{fmtPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Payment & Status Info */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#f8f9fa] rounded-xl p-3">
              <p className="text-[11px] text-[#aaa] m-0 mb-1">Phương thức thanh toán</p>
              <PaymentBadge method={order.paymentMethod} />
            </div>
            <div className="bg-[#f8f9fa] rounded-xl p-3">
              <p className="text-[11px] text-[#aaa] m-0 mb-1">Trạng thái thanh toán</p>
              <span
                className="text-[12px] font-bold"
                style={{ color: PAYMENT_STATUS_CONFIG[order.paymentStatus]?.color || '#888' }}
              >
                {PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label || '—'}
              </span>
            </div>
            <div className="bg-[#f8f9fa] rounded-xl p-3">
              <p className="text-[11px] text-[#aaa] m-0 mb-1">Thời gian đặt</p>
              <p className="text-[12px] font-semibold text-[#333] m-0">{fmtDate(order.createdAt)}</p>
            </div>
            <div className="bg-[#f8f9fa] rounded-xl p-3">
              <p className="text-[11px] text-[#aaa] m-0 mb-1">Mã đơn hàng</p>
              <p className="text-[12px] font-mono font-bold text-[#333] m-0">#{shortId}</p>
            </div>
          </div>

          {/* Cancel reason if cancelled */}
          {order.orderStatus === 'cancelled' && order.cancelReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider m-0 mb-1">
                <WarningOutlined className="mr-1" />Lý do hủy
              </p>
              <p className="text-[13px] text-red-600 m-0">{order.cancelReason}</p>
            </div>
          )}

          {/* Actions */}
          {nextStatuses.length > 0 && (
            <div className="border-t border-[#f0f0f0] pt-4">
              <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider m-0 mb-3">
                Cập nhật trạng thái
              </p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((ns) => {
                  const cfg = STATUS_CONFIG[ns];
                  const isPrimary = ns !== 'cancelled';
                  return (
                    <button
                      key={ns}
                      onClick={() => handleChangeStatus(ns)}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-px"
                      style={
                        isPrimary
                          ? { background: cfg.color, color: '#fff', border: `1px solid ${cfg.color}` }
                          : { background: '#fff', color: '#ef4444', border: '1px solid #fca5a5' }
                      }
                    >
                      {cfg.icon}
                      {isPrimary ? `Chuyển sang "${cfg.label}"` : 'Hủy đơn hàng'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Spin>
      </Drawer>

      {/* Cancel Reason Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-500">
            <WarningOutlined /> Xác nhận hủy đơn hàng #{shortId}
          </div>
        }
        open={cancelModalOpen}
        onCancel={() => { setCancelModalOpen(false); setCancelReason(''); }}
        onOk={handleConfirmCancel}
        okText="Xác nhận hủy"
        cancelText="Giữ lại"
        okButtonProps={{ danger: true, loading: updating }}
        confirmLoading={updating}
      >
        <p className="text-[13px] text-[#555] mb-3">Vui lòng nhập lý do hủy đơn hàng này:</p>
        <Input.TextArea
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Ví dụ: Khách hàng yêu cầu hủy, sản phẩm hết hàng..."
          // maxLength={200}
          // showCount
        />
      </Modal>
    </>
  );
};

// ── Quick Status Update ────────────────────────────────────────
const QuickStatusDropdown = ({ order, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const nextStatuses = NEXT_STATUSES[order.orderStatus] || [];

  if (nextStatuses.length === 0) return null;

  const handleQuick = async (ns) => {
    if (ns === 'cancelled') return; // Requires reason, handle in drawer
    setLoading(true);
    try {
      await updateOrderStatusAdmin(order._id, ns);
      message.success(`#${order._id.slice(-6).toUpperCase()} → ${STATUS_CONFIG[ns]?.label}`);
      onStatusChange();
    } catch {
      message.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const firstNext = nextStatuses.filter((s) => s !== 'cancelled')[0];
  if (!firstNext) return null;

  const cfg = STATUS_CONFIG[firstNext];
  return (
    <Tooltip title={`Chuyển sang "${cfg.label}"`}>
      <button
        onClick={(e) => { e.stopPropagation(); handleQuick(firstNext); }}
        disabled={loading}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all hover:shadow-md hover:-translate-y-px"
        style={{
          background: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.border}`,
        }}
      >
        {loading ? <span className="animate-spin text-[12px]">⏳</span> : cfg.icon}
        {cfg.label}
      </button>
    </Tooltip>
  );
};

// ── Tab Counts ─────────────────────────────────────────────────
const STATUS_TABS = [
  { key: 'all',       label: 'Tất cả'        },
  { key: 'pending',   label: 'Chờ xác nhận'  },
  { key: 'confirmed', label: 'Đang xử lý'    },
  { key: 'shipping',  label: 'Đang giao'     },
  { key: 'delivered', label: 'Hoàn thành'    },
  { key: 'cancelled', label: 'Đã hủy'        },
];

// ── Main Component ────────────────────────────────────────────
const AdminOrdersPage = () => {
  const [orders, setOrders]           = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [stats, setStats]             = useState({});
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [tabStatus, setTabStatus]     = useState('all');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange]     = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [tabCounts, setTabCounts]     = useState({});
  const searchTimeout                 = useRef(null);
  const LIMIT = 10;

  const buildParams = useCallback(() => ({
    page,
    limit: LIMIT,
    status: tabStatus !== 'all' ? tabStatus : undefined,
    paymentMethod: paymentFilter !== 'all' ? paymentFilter : undefined,
    search: search || undefined,
    from: dateRange?.[0]?.toISOString() || undefined,
    to:   dateRange?.[1]?.toISOString() || undefined,
  }), [page, tabStatus, search, paymentFilter, dateRange]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrdersAdmin(buildParams());
      setOrders(res.orders || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setStats(res.stats || {});
    } catch (err) {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Load tab counts (always without status filter, just for badge numbers)
  const loadTabCounts = useCallback(async () => {
    try {
      const all = await fetchAllOrdersAdmin({ limit: 1 });
      const counts = { all: all.total };
      await Promise.all(
        ['pending','confirmed','shipping','delivered','cancelled'].map(async (s) => {
          const r = await fetchAllOrdersAdmin({ status: s, limit: 1 });
          counts[s] = r.total;
        })
      );
      setTabCounts(counts);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadTabCounts();
  }, []);

  // Sync selectedOrder with updated orders list
  useEffect(() => {
    if (drawerOpen && selectedOrder) {
      const updatedOrder = orders.find(o => o._id === selectedOrder._id);
      if (updatedOrder && updatedOrder.orderStatus !== selectedOrder.orderStatus) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders, drawerOpen, selectedOrder]);

  // Debounce search
  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 500);
  };

  const handleTabChange = (key) => {
    setTabStatus(key);
    setPage(1);
  };

  const handleRefresh = () => {
    loadOrders();
    loadTabCounts();
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  // ── Table Columns ────────────────────────────────────────────
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      width: 110,
      align: 'center',
      render: (id) => (
        <span className="font-mono font-bold text-[13px] text-[#1a1a1a]">
          #{id?.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      width: 200,
      render: (_, r) => {
        const name = r.shippingAddress?.fullName || r.user?.fullName || '—';
        const phone = r.shippingAddress?.phone || r.user?.phone || '';
        return (
          <div>
            <p className="font-semibold text-[13px] text-[#1a1a1a] m-0 leading-tight truncate max-w-[180px]">
              {name}
            </p>
            {/* {phone && (
              <p className="text-[11px] text-[#aaa] m-0 mt-0.5">
                <PhoneOutlined className="mr-1" />{phone}
              </p>
            )} */}
          </div>
        );
      },
    },
    {
      title: 'Sản phẩm',
      width: 220,
      render: (_, r) => {
        const first = r.items?.[0];
        const extra = (r.items?.length || 1) - 1;
        return (
          <div className="flex items-center gap-2">
            {first?.image ? (
              <img
                src={first.image}
                alt={first.name}
                className="w-10 h-10 rounded-lg object-cover border border-[#f0f0f0] flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
                <ShoppingCartOutlined style={{ color: '#ddd', fontSize: 16 }} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#1a1a1a] m-0 truncate max-w-[150px]">
                {first?.name || '—'}
              </p>
              {extra > 0 && (
                <p className="text-[11px] text-[#aaa] m-0">+{extra} sản phẩm khác</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 130,
      render: (d) => (
        <span className="text-[12px] text-[#888]">{fmtDate(d)}</span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      width: 130,
      align: 'center',
      render: (v) => (
        <span className="font-bold text-[13px] text-[#1a1a1a] whitespace-nowrap">
          {fmtPrice(v)}
        </span>
      ),
    },
    {
      title: 'Thanh toán',
      width: 100,
      align: 'center',
      render: (_, r) => (
        <div className="flex flex-col gap-1 justify-center items-center">
          <PaymentBadge method={r.paymentMethod} />
          <span
            className="text-[11px] font-semibold"
            style={{ color: PAYMENT_STATUS_CONFIG[r.paymentStatus]?.color || '#888' }}
          >
            {PAYMENT_STATUS_CONFIG[r.paymentStatus]?.label || '—'}
          </span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      width: 140,
      align: 'center',
      render: (_, r) => <StatusBadge status={r.orderStatus} />,
    },
    {
      title: 'Thao tác',
      width: 140,
      align: 'center',
      fixed: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Tooltip title="Xem chi tiết">
            <button
              onClick={(e) => { e.stopPropagation(); openDetail(r); }}
              className="w-8 h-8 rounded-lg bg-[#f5f5f5] text-[#555] border-none cursor-pointer flex items-center justify-center hover:bg-[#1a1a1a] hover:text-white transition-all duration-200"
            >
              <EyeOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>
          <QuickStatusDropdown order={r} onStatusChange={handleRefresh} />
        </div>
      ),
    },
  ];

  const totalToday = stats.todayRevenue || 0;

  return (
    <AdminLayout
      title="Quản Lý Đơn Hàng"
      headerRight={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border-[1.5px] border-[#e0e0e0] text-[#444] rounded-xl text-[13px] font-semibold cursor-pointer hover:border-[#1a1a1a] transition-colors">
            <DownloadOutlined /> Xuất Excel
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border-[1.5px] border-[#e0e0e0] text-[#444] rounded-xl text-[13px] font-semibold cursor-pointer hover:border-[#1a1a1a] transition-colors">
            <PrinterOutlined /> Báo cáo
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* ── Main Table Card ── */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">

          {/* Status Tabs */}
          <div className="border-b border-[#f5f5f5] px-6">
            <div className="flex items-center gap-0 overflow-x-auto">
              {STATUS_TABS.map((tab) => {
                const cnt = tabCounts[tab.key];
                const isActive = tabStatus === tab.key;
                const cfg = STATUS_CONFIG[tab.key];
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className="flex items-center gap-2 px-4 py-4 border-none bg-transparent text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 border-b-2 relative"
                    style={{
                      color: isActive ? (cfg?.color || '#1a1a1a') : '#888',
                      borderBottomColor: isActive ? (cfg?.color || '#1a1a1a') : 'transparent',
                      borderBottomWidth: 2,
                      borderBottomStyle: 'solid',
                    }}
                  >
                    {tab.label}
                    {cnt !== undefined && (
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                        style={{
                          background: isActive ? (cfg?.bg || '#f0f0f0') : '#f5f5f5',
                          color: isActive ? (cfg?.color || '#1a1a1a') : '#888',
                        }}
                      >
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
              placeholder="Tìm theo mã đơn, họ tên, số điện thoại..."
              prefix={<SearchOutlined className="text-[#ccc]" />}
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              size="large"
              className="rounded-xl w-full md:max-w-[400px]"
              allowClear
            />
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              <Select
                value={paymentFilter}
                onChange={(v) => { setPaymentFilter(v); setPage(1); }}
                size="large"
                className="rounded-xl w-full sm:w-[160px]"
                options={[
                  { value: 'all',   label: 'Tất cả PTTT' },
                  { value: 'cod',   label: 'COD' },
                  { value: 'vnpay', label: 'VNPay' },
                  { value: 'momo',  label: 'MoMo' },
                ]}
              />
              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                format="DD/MM/YYYY"
                onChange={(dates) => {
                  setDateRange(dates ? [dates[0].toDate(), dates[1].toDate()] : null);
                  setPage(1);
                }}
                size="large"
                className="rounded-xl w-full sm:w-auto"
              />
              {/* <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <span className="text-[13px] text-[#aaa] font-medium">
                {total.toLocaleString('vi-VN')} đơn hàng
              </span>
                <Tooltip title="Làm mới">
                  <button
                    onClick={handleRefresh}
                    className="w-10 h-10 rounded-xl bg-[#f5f5f5] border-none text-[#555] cursor-pointer flex items-center justify-center hover:bg-[#1a1a1a] hover:text-white transition-all duration-200"
                  >
                    <ReloadOutlined style={{ fontSize: 15 }} />
                  </button>
                </Tooltip>
              </div> */}
            </div>
          </div>

          {/* Table */}
          <div style={{ minHeight: 400 }}>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spin size="large" tip="Đang tải đơn hàng..." />
              </div>
            ) : orders.length === 0 ? (
              <Empty
                className="py-16"
                description={
                  <span className="text-[#aaa] text-[13px]">
                    Không tìm thấy đơn hàng nào
                  </span>
                }
              />
            ) : (
              <Table
                dataSource={orders}
                columns={columns}
                rowKey="_id"
                pagination={false}
                size="middle"
                scroll={{ x: 1100 }}
                rowClassName="hover:bg-[#fafafa]"
              />
            )}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#f5f5f5]">
              <span className="text-[12px] text-[#aaa]">
                Trang {page} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] font-semibold bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Trước
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg border text-[13px] font-semibold cursor-pointer transition-all duration-200"
                      style={
                        page === p
                          ? { background: '#1a1a1a', color: '#fff', border: '1px solid #1a1a1a' }
                          : { background: '#fff', color: '#555', border: '1px solid #e5e5e5' }
                      }
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-[#aaa]">...</span>}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] font-semibold bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={() => {
          handleRefresh();
          loadTabCounts();
        }}
      />
    </AdminLayout>
  );
};

export default AdminOrdersPage;
