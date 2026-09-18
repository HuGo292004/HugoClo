// ============================================================
// AdminProductsPage — CRUD quản lý sản phẩm
// Route: /admin/products (protected, admin only)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Tag, Button, Input, Select, Modal, Form,
  InputNumber, Upload, Switch, Popconfirm, Tooltip,
  message, Spin, Empty, Space, Checkbox, Pagination,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, UploadOutlined,
  ExclamationCircleOutlined, ReloadOutlined,
  FilterOutlined, DownloadOutlined,
} from '@ant-design/icons';
import AdminLayout from './AdminLayout';
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
} from '../../api/productService';
import api from '../../api/axios';

const { Option } = Select;
const { TextArea } = Input;

// ── Helpers ──────────────────────────────────────────────────
const formatPrice = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const PRODUCT_TYPE_LABEL = {
  tops: 'Áo', bottoms: 'Quần', shoes: 'Giày', accessory: 'Phụ Kiện',
};
const GENDER_LABEL = { men: 'Nam', women: 'Nữ', unisex: 'Unisex' };
const GENDER_COLOR = { men: 'blue', women: 'pink', unisex: 'default' };
const TYPE_COLOR   = { tops: 'blue', bottoms: 'purple', shoes: 'gold', accessory: 'green' };

const stockColor = (s) => {
  if (s === 0) return 'text-red-500';
  if (s < 10)  return 'text-orange-500';
  if (s < 30)  return 'text-yellow-600';
  return 'text-green-600';
};

// ── Add/Edit Product Modal ────────────────────────────────────
const ProductModal = ({ open, onClose, onSaved, editProduct }) => {
  const [form]    = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open) {
      if (editProduct) {
        const originalPrice = editProduct.originalPrice || editProduct.price;
        const discountPercent = editProduct.originalPrice 
          ? Math.round((1 - editProduct.price / editProduct.originalPrice) * 100) 
          : 0;

        form.setFieldsValue({
          name:          editProduct.name,
          description:   editProduct.description,
          basePrice:     originalPrice,
          discountPercent: discountPercent,
          stock:         editProduct.stock,
          gender:        editProduct.gender,
          productType:   editProduct.productType,
          material:      editProduct.material,
        });
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, editProduct, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const { basePrice, discountPercent, ...restValues } = values;
      
      let finalPrice = basePrice;
      let finalOriginalPrice = basePrice;

      if (discountPercent > 0) {
        finalPrice = Math.round(basePrice * (1 - discountPercent / 100));
      }

      const formData = new FormData();
      Object.entries(restValues).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v);
      });
      formData.append('price', finalPrice);
      formData.append('originalPrice', finalOriginalPrice);
      formData.append('isOnSale', discountPercent > 0);
      fileList.forEach((f) => {
        if (f.originFileObj) formData.append('images', f.originFileObj);
      });

      if (editProduct) {
        await updateProduct(editProduct._id, formData);
        message.success('Đã cập nhật sản phẩm!');
      } else {
        await createProduct(formData);
        message.success('Đã thêm sản phẩm mới!');
      }

      onSaved();
      onClose();
    } catch (err) {
      if (err?.errorFields) return; // Ant Design validation error
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span className="text-[18px] font-bold text-[#1a1a1a]">
          {editProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        </span>
      }
      width={850}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        {/* Name */}
        <Form.Item name="name" label="Tên Sản Phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
          <Input placeholder="Nhập tên sản phẩm..." size="large" />
        </Form.Item>

        {/* Category + Gender row */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="productType" label="Loại Sản Phẩm" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại" size="large">
              <Option value="tops">Áo</Option>
              <Option value="bottoms">Quần</Option>
              <Option value="shoes">Giày</Option>
              <Option value="accessory">Phụ Kiện</Option>
            </Select>
          </Form.Item>
          <Form.Item name="gender" label="Giới Tính" rules={[{ required: true }]}>
            <Select placeholder="Chọn giới tính" size="large">
              <Option value="men">Nam</Option>
              <Option value="women">Nữ</Option>
              <Option value="unisex">Unisex</Option>
            </Select>
          </Form.Item>
        </div>



        {/* Price row */}
        <div className="grid grid-cols-3 gap-4">
          <Form.Item 
            name="basePrice" 
            label="Giá Sản Phẩm (đ)" 
            rules={[
              { required: true, message: 'Vui lòng nhập giá sản phẩm' },
              { type: 'number', min: 1000, message: 'Giá phải từ 1,000đ trở lên' }
            ]}
          >
            <InputNumber
              min={0} step={1000} size="large"
              formatter={(v) => v?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v?.replace(/,/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item 
            name="discountPercent" 
            label="Giảm Giá (%)"
            rules={[
              { type: 'number', min: 0, max: 100, message: 'Giảm giá phải từ 0% đến 100%' }
            ]}
          >
            <InputNumber min={0} max={100} size="large" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item 
            name="stock" 
            label="Tồn Kho" 
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng tồn kho' },
              { type: 'number', min: 0, message: 'Tồn kho không được là số âm' }
            ]}
          >
            <InputNumber min={0} size="large" style={{ width: '100%' }} />
          </Form.Item>
        </div>

        {/* Material */}
        <Form.Item name="material" label="Chất Liệu">
          <Input placeholder="VD: Cotton 100% cao cấp..." size="large" />
        </Form.Item>

        {/* Description */}
        <Form.Item name="description" label="Mô Tả">
          <TextArea rows={3} placeholder="Mô tả sản phẩm..." />
        </Form.Item>

        {/* Images */}
        <Form.Item label="Hình Ảnh Sản Phẩm">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: fl }) => setFileList(fl)}
            beforeUpload={() => false}
            accept="image/*"
            multiple
          >
            {fileList.length < 5 && (
              <div className="flex flex-col items-center gap-1 text-[#999]">
                <UploadOutlined style={{ fontSize: 20 }} />
                <span className="text-[12px]">Tải ảnh lên</span>
              </div>
            )}
          </Upload>
          {editProduct?.images?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {editProduct.images.map((src, i) => (
                <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#f0f0f0]" />
              ))}
            </div>
          )}
        </Form.Item>



        {/* Footer buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[#f0f0f0] mt-4">
          <Button onClick={onClose} size="large">Hủy</Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            className="bg-[#1a1a1a] border-[#1a1a1a] hover:bg-[#333] hover:border-[#333]"
          >
            {editProduct ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ── View Product Modal ───────────────────────────────────────
const ProductDetailModal = ({ open, onClose, product }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (open) setSelectedImage(0);
  }, [open, product]);

  if (!product) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<span className="text-[18px] font-bold text-[#1a1a1a]">Chi Tiết Sản Phẩm</span>}
      width={700}
      footer={
        <Button onClick={onClose} size="large">Đóng</Button>
      }
    >
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        {/* Images */}
        <div className="w-full md:w-1/2">
          {product.images && product.images.length > 0 ? (
            <div className="flex flex-col gap-2">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-80 rounded-xl object-cover border border-[#f0f0f0]" />
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt="" 
                      className={`w-16 h-16 flex-shrink-0 rounded-lg object-cover border cursor-pointer transition-all hover:opacity-100 ${selectedImage === idx ? 'border-blue-500 opacity-100' : 'border-[#f0f0f0] opacity-50'}`}
                      onClick={() => setSelectedImage(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-[#f0f0f0]">
              Không có hình ảnh
            </div>
          )}
        </div>
        
        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold m-0 text-[#1a1a1a]">{product.name}</h2>
            {/* <p className="text-gray-500 font-mono m-0 text-[13px]">#{product._id}</p> */}
          </div>
          
          <div className="flex gap-2">
            <Tag color={TYPE_COLOR[product.productType] || 'default'} className="rounded-full">
              {PRODUCT_TYPE_LABEL[product.productType] || product.productType}
            </Tag>
            <Tag color={GENDER_COLOR[product.gender] || 'default'} className="rounded-full">
              {GENDER_LABEL[product.gender] || product.gender}
            </Tag>
            <Tag color={product.isOnSale ? 'orange' : 'success'} className="rounded-full">
              {product.isOnSale ? 'Sale' : 'Bình thường'}
            </Tag>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-2 border border-[#f0f0f0]">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-[13px]">Giá bán:</span>
              <span className="font-bold text-[16px] text-red-500">{formatPrice(product.price)}</span>
            </div>
            {product.originalPrice && product.isOnSale && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[13px]">Giá gốc:</span>
                <span className="line-through text-gray-400 text-[13px]">{formatPrice(product.originalPrice)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-[13px]">Tồn kho:</span>
              <span className={`font-bold text-[14px] ${stockColor(product.stock)}`}>{product.stock}</span>
            </div>
          </div>

          {product.material && (
            <div>
              <span className="font-semibold block mb-1 text-[13px] text-gray-800">Chất liệu:</span>
              <p className="text-gray-600 m-0 text-[13px]">{product.material}</p>
            </div>
          )}

          {product.description && (
            <div>
              <span className="font-semibold block mb-1 text-[13px] text-gray-800">Mô tả:</span>
              <p className="text-gray-600 m-0 whitespace-pre-line text-[13px] bg-gray-50 p-3 rounded-lg border border-[#f0f0f0] max-h-32 overflow-y-auto">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ── Main Page ────────────────────────────────────────────────
const AdminProductsPage = () => {
  const navigate = useNavigate();

  // Data state
  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);

  // Filter state
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);
  const [keyword,     setKeyword]     = useState('');
  const [filterType,  setFilterType]  = useState('');
  const [filterGender,setFilterGender]= useState('');
  const [filterSale,  setFilterSale]  = useState('');

  // Modal state
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  // Selection
  const [selectedKeys, setSelectedKeys] = useState([]);

  // ── Fetch ──────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (keyword)      params.keyword     = keyword;
      if (filterType)   params.productType = filterType;
      if (filterGender) params.gender      = filterGender;
      if (filterSale === 'sale') params.isOnSale = true;

      const data = await fetchProducts(params);
      setProducts((data.products || []).map(p => ({ ...p, key: p._id })));
      setTotal(data.totalProducts || 0);
    } catch {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, filterType, filterGender, filterSale]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Handlers ───────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success('Đã xóa sản phẩm');
      loadProducts();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedKeys.length) return;
    Modal.confirm({
      title: `Xóa ${selectedKeys.length} sản phẩm đã chọn?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        await Promise.all(selectedKeys.map(id => deleteProduct(id)));
        message.success(`Đã xóa ${selectedKeys.length} sản phẩm`);
        setSelectedKeys([]);
        loadProducts();
      },
    });
  };

  const openAdd   = ()  => { setEditProduct(null); setModalOpen(true); };
  const openEdit  = (p) => { setEditProduct(p);    setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditProduct(null); };

  const openView = (p) => { setViewProduct(p); setViewModalOpen(true); };
  const closeViewModal = () => { setViewModalOpen(false); setViewProduct(null); };

  // Reset filters
  const handleReset = () => {
    setKeyword(''); setFilterType(''); setFilterGender(''); setFilterSale('');
    setPage(1);
  };

  // ── Columns ────────────────────────────────────────────────
  const columns = [
    {
      title: '',
      dataIndex: 'key',
      width: 44,
      render: (id) => (
        <Checkbox
          checked={selectedKeys.includes(id)}
          onChange={(e) =>
            setSelectedKeys(prev =>
              e.target.checked ? [...prev, id] : prev.filter(k => k !== id)
            )
          }
        />
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold">ID</span>,
      dataIndex: '_id',
      width: 60,
      align: 'center',
      render: (_, __, idx) => (
        <span className="text-black font-semibold text-[13px]">
          {(page - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold whitespace-nowrap">Hình Ảnh</span>,
      dataIndex: 'images',
      width: 90,
      align: 'center',
      render: (imgs, r) => (
        <img
          src={imgs?.[0] || 'https://via.placeholder.com/50'}
          alt={r.name}
          className="w-12 h-12 rounded-xl object-cover border border-[#f0f0f0] cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openView(r)}
        />
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold">Tên Sản Phẩm</span>,
      dataIndex: 'name',
      render: (name, r) => (
        <div>
          <p
            className="font-semibold text-[13px] text-[#1a1a1a] m-0 leading-tight cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => openView(r)}
          >
            {name}
          </p>
          <p className="text-[11px] text-[#bbb] m-0 mt-0.5 font-mono">
            #{r._id?.slice(-6).toUpperCase()}
          </p>
        </div>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold whitespace-nowrap">Loại</span>,
      dataIndex: 'productType',
      width: 120,
      align: 'center',
      render: (v) => (
        <Tag color={TYPE_COLOR[v] || 'default'} className="rounded-full font-semibold text-[12px]">
          {PRODUCT_TYPE_LABEL[v] || v}
        </Tag>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold whitespace-nowrap">Giới Tính</span>,
      dataIndex: 'gender',
      width: 110,
      align: 'center',
      render: (v) => (
        <Tag color={GENDER_COLOR[v] || 'default'} className="rounded-full font-semibold text-[12px]">
          {GENDER_LABEL[v] || v}
        </Tag>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold whitespace-nowrap">Giá</span>,
      dataIndex: 'price',
      width: 130,
      align: 'center',
      sorter: (a, b) => a.price - b.price,
      render: (v, r) => (
        <div>
          <p className="font-bold text-[13px] text-[#1a1a1a] m-0">{formatPrice(v)}</p>
          {r.originalPrice && r.isOnSale && (
            <p className="text-[11px] text-[#bbb] m-0 line-through">{formatPrice(r.originalPrice)}</p>
          )}
        </div>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold whitespace-nowrap">Tồn Kho</span>,
      dataIndex: 'stock',
      width: 110,
      align: 'center',
      sorter: (a, b) => a.stock - b.stock,
      render: (v) => (
        <span className={`font-bold text-[13px] ${stockColor(v)}`}>
          {v === 0 ? 'Hết hàng' : v}
        </span>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold whitespace-nowrap">Trạng Thái</span>,
      dataIndex: 'isOnSale',
      width: 130,
      align: 'center',
      render: (v) => (
        <Tag
          color={v ? 'orange' : 'success'}
          className="rounded-full font-semibold text-[12px]"
        >
          {v ? 'Sale' : 'Bình thường'}
        </Tag>
      ),
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold whitespace-nowrap">Ngày Tạo</span>,
      dataIndex: 'createdAt',
      width: 120,
      align: 'center',
      render: (v) => <span className="text-[12px] text-[#999]">{formatDate(v)}</span>,
    },
    {
      title: <span className="text-[11px] uppercase tracking-wider text-black font-bold whitespace-nowrap">Thao Tác</span>,
      width: 130,
      align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <button
              onClick={() => openView(r)}
              className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 border-none cursor-pointer flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <EyeOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <button
              onClick={() => openEdit(r)}
              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 border-none cursor-pointer flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
            >
              <EditOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa sản phẩm này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={() => handleDelete(r._id)}
              okText="Xóa"
              okButtonProps={{ danger: true }}
              cancelText="Hủy"
            >
              <button className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border-none cursor-pointer flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                <DeleteOutlined style={{ fontSize: 13 }} />
              </button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  return (
    <AdminLayout
      title="Quản Lý Sản Phẩm"
      headerRight={
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-xl border-none text-[13px] font-semibold cursor-pointer hover:bg-[#333] hover:-translate-y-px hover:shadow-lg transition-all duration-200"
        >
          <PlusOutlined /> THÊM SẢN PHẨM
        </button>
      }
    >
      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <Input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined className="text-[#ccc]" />}
            size="large"
            allowClear
            style={{ width: 550 }}
            className="rounded-xl"
          />

          <div className="flex items-center gap-3 flex-wrap">
            {/* Product type filter */}
          <Select
            value={filterType || undefined}
            onChange={(v) => { setFilterType(v || ''); setPage(1); }}
            placeholder="Tất Cả Loại"
            size="large"
            allowClear
            style={{ width: 150 }}
          >
            <Option value="tops">Áo</Option>
            <Option value="bottoms">Quần</Option>
            <Option value="shoes">Giày</Option>
            <Option value="accessory">Phụ Kiện</Option>
          </Select>

          {/* Gender filter */}
          <Select
            value={filterGender || undefined}
            onChange={(v) => { setFilterGender(v || ''); setPage(1); }}
            placeholder="Tất Cả Giới Tính"
            size="large"
            allowClear
            style={{ width: 190 }}
          >
            <Option value="men">Nam</Option>
            <Option value="women">Nữ</Option>
            <Option value="unisex">Unisex</Option>
          </Select>

          {/* Sale filter */}
          <Select
            value={filterSale || undefined}
            onChange={(v) => { setFilterSale(v || ''); setPage(1); }}
            placeholder="Trạng Thái"
            size="large"
            allowClear
            style={{ width: 150 }}
          >
            <Option value="sale">Đang Sale</Option>
            <Option value="">Tất Cả</Option>
          </Select>

          {/* Reset */}
          {/* <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e0e0e0] bg-white text-[#666] text-[13px] font-medium cursor-pointer hover:border-[#1a1a1a] transition-colors"
          >
            <ReloadOutlined style={{ fontSize: 12 }} /> Đặt lại
          </button> */}
          </div>

          {/* Right: count */}
          {/* <span className="ml-auto text-[13px] text-[#999]">
            Hiển thị <strong className="text-[#1a1a1a]">{start}–{end}</strong> / <strong className="text-[#1a1a1a]">{total}</strong> sản phẩm
          </span> */}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Bulk actions bar */}
        {selectedKeys.length > 0 && (
          <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 border-b border-blue-100">
            <span className="text-[13px] font-semibold text-blue-700">
              Đã chọn {selectedKeys.length} sản phẩm
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-red-600 transition-colors"
            >
              <DeleteOutlined /> Xóa Đã Chọn
            </button>
            <button
              onClick={() => setSelectedKeys([])}
              className="text-[13px] text-[#666] bg-transparent border-none cursor-pointer hover:underline"
            >
              Bỏ chọn
            </button>
          </div>
        )}

        <Table
          dataSource={products}
          columns={columns}
          loading={loading}
          pagination={false}
          size="middle"
          scroll={{ x: 1350 }}
          rowClassName={(_, idx) =>
            `transition-colors hover:bg-[#f8f9ff] ${idx % 2 === 0 ? '' : 'bg-[#fafafa]'}`
          }
          locale={{
            emptyText: (
              <Empty
                description="Không có sản phẩm nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />

        {/* Footer: bulk + pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#f5f5f5]">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#bbb]">Mỗi trang:</span>
            {[10, 20, 50].map((n) => (
              <button
                key={n}
                onClick={() => { setPageSize(n); setPage(1); }}
                className={`w-9 h-8 rounded-lg text-[13px] font-semibold border cursor-pointer transition-all ${
                  pageSize === n
                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                    : 'bg-white text-[#555] border-[#e0e0e0] hover:border-[#1a1a1a]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            showQuickJumper
            size="small"
          />
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <ProductModal
        open={modalOpen}
        onClose={closeModal}
        onSaved={loadProducts}
        editProduct={editProduct}
      />

      {/* ── View Modal ── */}
      <ProductDetailModal
        open={viewModalOpen}
        onClose={closeViewModal}
        product={viewProduct}
      />
    </AdminLayout>
  );
};

export default AdminProductsPage;
