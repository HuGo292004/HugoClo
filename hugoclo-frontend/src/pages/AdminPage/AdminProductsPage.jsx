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
  LeftOutlined, RightOutlined, CloseOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { extractColorsFromImage } from '../../utils/colorThiefUtils';
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
  const [form]               = Form.useForm();
  const [loading, setLoading]= useState(false);

  // Quản lý ảnh: mảng object [{ id, url, file, isExisting }]
  const [images, setImages]  = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Quản lý màu sắc
  const [productColors, setProductColors]         = useState([]); // Màu được lưu cho sản phẩm [{ name, code }]
  const [suggestedColors, setSuggestedColors]     = useState([]); // Màu gợi ý từ ColorThief [{ name, code }]
  const [isExtractingColor, setIsExtractingColor] = useState(false);

  useEffect(() => {
    if (open) {
      if (editProduct) {
        const originalPrice = editProduct.originalPrice || editProduct.price;
        const discountPercent = editProduct.originalPrice 
          ? Math.round((1 - editProduct.price / editProduct.originalPrice) * 100) 
          : 0;

        form.setFieldsValue({
          name:            editProduct.name,
          description:     editProduct.description,
          basePrice:       originalPrice,
          discountPercent: discountPercent,
          stock:           editProduct.stock,
          gender:          editProduct.gender,
          productType:     editProduct.productType,
          material:        editProduct.material,
        });

        // Nạp danh sách ảnh hiện có
        const existingImgs = (editProduct.images || []).map((url, i) => ({
          id: `existing-${i}-${url}`,
          url,
          isExisting: true,
        }));
        setImages(existingImgs);

        // Nạp danh sách màu hiện có, liên kết với ảnh tương ứng
        const loadedColors = (editProduct.colors || []).map((c, i) => {
          let matchedImgId = null;
          if (c.images && c.images.length > 0) {
            const foundImg = existingImgs.find((im) => im.url === c.images[0]);
            if (foundImg) matchedImgId = foundImg.id;
          }
          // Nếu sản phẩm cũ chưa có c.images, gán theo index ảnh tương ứng
          if (!matchedImgId && existingImgs[i]) {
            matchedImgId = existingImgs[i].id;
          }
          return {
            name: c.name,
            code: c.code,
            imageId: matchedImgId,
          };
        });
        setProductColors(loadedColors);

        // Trích xuất màu đề xuất từ các ảnh hiện có bằng ColorThief
        if (editProduct.images?.length > 0) {
          setIsExtractingColor(true);
          Promise.all(editProduct.images.slice(0, 5).map((u) => extractColorsFromImage(u)))
            .then((res) => {
              const uniqueList = [];
              res.flat().forEach((c) => {
                if (c && !uniqueList.some((x) => x.code.toLowerCase() === c.code.toLowerCase())) {
                  uniqueList.push(c);
                }
              });
              setSuggestedColors(uniqueList);
            })
            .catch(() => {})
            .finally(() => setIsExtractingColor(false));
        } else {
          setSuggestedColors([]);
        }
      } else {
        form.resetFields();
        setImages([]);
        setProductColors([]);
        setSuggestedColors([]);
      }
    }
  }, [open, editProduct, form]);

  // Xử lý khi thêm file ảnh mới
  const handleAddFile = async (file) => {
    if (images.length >= 8) {
      message.warning('Tối đa 8 hình ảnh cho mỗi sản phẩm');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const newImgId = `new-${Date.now()}-${Math.random()}`;
    const newImg = {
      id: newImgId,
      url: objectUrl,
      file,
      isExisting: false,
    };

    setImages((prev) => [...prev, newImg]);

    // Trích xuất màu tự động bằng ColorThief cho chính tấm ảnh này
    setIsExtractingColor(true);
    try {
      const extracted = await extractColorsFromImage(file);
      if (extracted && extracted.length > 0) {
        // Cập nhật danh sách gợi ý
        setSuggestedColors((prev) => {
          const combined = [...prev];
          extracted.forEach((c) => {
            if (!combined.some((x) => x.code.toLowerCase() === c.code.toLowerCase())) {
              combined.push(c);
            }
          });
          return combined;
        });

        // Màu chủ đạo của tấm ảnh này
        const primaryColor = extracted[0];

        // Tự động thêm màu và GÁN LUÔN tấm ảnh này vào màu đó
        setProductColors((prev) => {
          const existsIdx = prev.findIndex((c) => c.code.toLowerCase() === primaryColor.code.toLowerCase());
          if (existsIdx === -1) {
            message.info(`ColorThief đề xuất màu "${primaryColor.name}" cho ảnh vừa tải`);
            return [
              ...prev,
              {
                name: primaryColor.name,
                code: primaryColor.code,
                imageId: newImgId,
              },
            ];
          } else {
            // Nếu màu đã có nhưng chưa gán ảnh, gán ảnh mới này vào màu đó
            return prev.map((c, idx) => {
              if (idx === existsIdx && !c.imageId) {
                return { ...c, imageId: newImgId };
              }
              return c;
            });
          }
        });
      }
    } catch (err) {
      console.warn('Lỗi trích xuất màu:', err);
    } finally {
      setIsExtractingColor(false);
    }
  };

  // Đổi thứ tự ảnh bằng nút mũi tên
  const handleMoveImage = (index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Đổi thứ tự ảnh bằng kéo thả (Drag and Drop)
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setImages((prev) => {
      const copy = [...prev];
      const [draggedItem] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, draggedItem);
      return copy;
    });
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Xóa ảnh
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Quản lý màu sắc
  const handleToggleSuggestedColor = (sc) => {
    setProductColors((prev) => {
      const exists = prev.some((c) => c.code.toLowerCase() === sc.code.toLowerCase());
      if (exists) {
        return prev.filter((c) => c.code.toLowerCase() !== sc.code.toLowerCase());
      }
      return [...prev, { name: sc.name, code: sc.code }];
    });
  };

  const handleAddAllSuggestedColors = () => {
    setProductColors((prev) => {
      const combined = [...prev];
      suggestedColors.forEach((sc) => {
        if (!combined.some((c) => c.code.toLowerCase() === sc.code.toLowerCase())) {
          combined.push({ name: sc.name, code: sc.code });
        }
      });
      return combined;
    });
  };

  const handleAddCustomColor = () => {
    setProductColors((prev) => [
      ...prev,
      { name: 'Màu mới', code: '#1a1a1a' },
    ]);
  };

  const handleColorChange = (index, field, value) => {
    setProductColors((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveProductColor = (index) => {
    setProductColors((prev) => prev.filter((_, i) => i !== index));
  };

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

      // Chuẩn bị danh sách newFiles theo thứ tự gửi lên
      const newFiles = [];
      images.forEach((img) => {
        if (img.file) newFiles.push(img.file);
      });

      // Format colors kèm ảnh tương ứng
      const formattedColors = productColors.map((col) => {
        let colorImgs = [];
        if (col.imageId) {
          const matchedImg = images.find((im) => im.id === col.imageId);
          if (matchedImg) {
            if (matchedImg.isExisting) {
              colorImgs = [`existing:${matchedImg.url}`];
            } else if (matchedImg.file) {
              const fileIdx = newFiles.indexOf(matchedImg.file);
              if (fileIdx !== -1) {
                colorImgs = [`new:${fileIdx}`];
              }
            }
          }
        }
        return {
          name: col.name,
          code: col.code,
          images: colorImgs,
        };
      });

      // Gửi mảng màu sắc đã liên kết ảnh
      formData.append('colors', JSON.stringify(formattedColors));

      // Gửi ảnh theo đúng thứ tự đã sắp xếp
      if (editProduct) {
        const imageOrder = [];
        let newIndex = 0;
        images.forEach((img) => {
          if (img.isExisting) {
            imageOrder.push(`existing:${img.url}`);
          } else if (img.file) {
            imageOrder.push(`new:${newIndex}`);
            formData.append('images', img.file);
            newIndex++;
          }
        });
        formData.append('imageOrder', JSON.stringify(imageOrder));
      } else {
        images.forEach((img) => {
          if (img.file) {
            formData.append('images', img.file);
          }
        });
      }

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

        {/* Images with Reorder & Drag-and-drop */}
        <Form.Item 
          label={
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-[14px]">Hình Ảnh Sản Phẩm</span>
            </div>
          }
        >
          <div className="flex flex-wrap gap-3 items-center">
            {/* Nút Upload giữ nguyên vị trí và phong cách */}
            {images.length < 8 && (
              <Upload
                beforeUpload={(file) => {
                  handleAddFile(file);
                  return false;
                }}
                showUploadList={false}
                accept="image/*"
                multiple
              >
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#d9d9d9] hover:border-[#1a1a1a] flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#1a1a1a] cursor-pointer transition-all bg-[#fafafa] hover:bg-white shadow-sm">
                  <UploadOutlined style={{ fontSize: 22 }} />
                  <span className="text-[12px] font-medium">Tải ảnh lên</span>
                </div>
              </Upload>
            )}

            {/* Danh sách ảnh kéo thả và có nút đổi vị trí */}
            {images.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing group transition-all select-none shadow-sm ${
                  draggedIndex === index
                    ? 'opacity-40 border-dashed border-blue-500 scale-95'
                    : 'border-[#e8e8e8] hover:border-[#1a1a1a] hover:shadow-md'
                }`}
              >
                <img
                  src={img.url}
                  alt={`Ảnh ${index + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Badge Ảnh chính hoặc số thứ tự */}
                <div className="absolute top-1 left-1 pointer-events-none">
                  {index === 0 ? (
                    <span className="px-1.5 py-0.5 bg-[#1a1a1a] text-white text-[10px] font-bold rounded shadow">
                      Ảnh chính
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-semibold rounded backdrop-blur-sm">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Badge hiển thị màu đang gắn với ảnh này */}
                {(() => {
                  const linkedColor = productColors.find((c) => c.imageId === img.id);
                  if (!linkedColor) return null;
                  return (
                    <div className="absolute bottom-6 left-1 pointer-events-none z-10">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-semibold backdrop-blur-sm shadow">
                        <span className="w-2 h-2 rounded-full border border-white/40" style={{ backgroundColor: linkedColor.code }} />
                        {linkedColor.name}
                      </span>
                    </div>
                  );
                })()}

                {/* Nút Xóa ảnh */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  title="Xóa ảnh này"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer shadow z-10"
                >
                  <CloseOutlined style={{ fontSize: 9 }} />
                </button>

                {/* Thanh điều khiển thứ tự (nút mũi tên trái/phải) */}
                <div className="absolute bottom-0 inset-x-0 bg-black/75 py-1 px-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, -1)}
                    disabled={index === 0}
                    title="Chuyển sang trái"
                    className="w-5 h-5 flex items-center justify-center text-white hover:text-blue-300 disabled:opacity-20 disabled:hover:text-white border-none bg-transparent cursor-pointer p-0"
                  >
                    <LeftOutlined style={{ fontSize: 10 }} />
                  </button>
                  <span className="text-[10px] text-gray-300 font-mono">
                    {index + 1}/{images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, 1)}
                    disabled={index === images.length - 1}
                    title="Chuyển sang phải"
                    className="w-5 h-5 flex items-center justify-center text-white hover:text-blue-300 disabled:opacity-20 disabled:hover:text-white border-none bg-transparent cursor-pointer p-0"
                  >
                    <RightOutlined style={{ fontSize: 10 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Form.Item>

        {/* Colors Section (ColorThief Suggestions & Selected Colors) */}
        <div className="border border-[#ebebeb] rounded-2xl p-4 bg-[#fafafa] mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wide">
                Màu Sắc Sản Phẩm ({productColors.length})
              </span>
              {isExtractingColor && (
                <span className="text-[12px] text-blue-600 flex items-center gap-1 font-normal">
                  <Spin size="small" /> Đang trích xuất màu từ ảnh...
                </span>
              )}
            </div>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddCustomColor}
              className="text-[12px]"
            >
              Thêm màu tùy chỉnh
            </Button>
          </div>

          {/* Bảng màu gợi ý từ ảnh thông qua ColorThief */}
          {/* {suggestedColors.length > 0 && (
            <div className="mb-4 p-3 bg-white rounded-xl border border-[#e8e8e8]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-[#555] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Màu đề xuất từ ảnh (ColorThief) — Click để thêm vào sản phẩm:
                </span>
                <Button
                  type="link"
                  size="small"
                  onClick={handleAddAllSuggestedColors}
                  className="text-[12px] p-0 h-auto font-medium"
                >
                  + Thêm tất cả
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestedColors.map((sc, idx) => {
                  const isAdded = productColors.some(
                    (c) => c.code.toLowerCase() === sc.code.toLowerCase()
                  );
                  return (
                    <button
                      key={`${sc.code}-${idx}`}
                      type="button"
                      onClick={() => handleToggleSuggestedColor(sc)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-sm'
                          : 'bg-white text-[#333] border-[#d9d9d9] hover:border-[#1a1a1a] hover:bg-[#f5f5f5]'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shadow-inner shrink-0"
                        style={{ backgroundColor: sc.code }}
                      />
                      <span>{sc.name}</span>
                      <span className="font-mono text-[11px] opacity-75">{sc.code}</span>
                      {isAdded ? (
                        <CheckOutlined className="text-[11px]" />
                      ) : (
                        <PlusOutlined className="text-[10px]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* Danh sách màu đã chọn cho sản phẩm */}
          {productColors.length === 0 ? (
            <div className="text-center py-4 text-[#999] text-[13px] bg-white rounded-xl border border-dashed border-[#e0e0e0]">
              Chưa có màu sắc nào. Tải ảnh lên để ColorThief tự động đề xuất hoặc nhấn "Thêm màu tùy chỉnh".
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {productColors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#ebebeb] shadow-sm flex-wrap sm:flex-nowrap"
                >
                  {/* Color picker circle */}
                  <div className="relative w-8 h-8 shrink-0">
                    <input
                      type="color"
                      value={color.code?.startsWith('#') && color.code.length === 7 ? color.code : '#1a1a1a'}
                      onChange={(e) => handleColorChange(idx, 'code', e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      title="Đổi mã màu"
                    />
                    <div
                      className="w-8 h-8 rounded-full border border-black/20 shadow-sm cursor-pointer"
                      style={{ backgroundColor: color.code }}
                    />
                  </div>

                  {/* Color Name Input */}
                  <Input
                    size="small"
                    placeholder="Tên màu (vd: Đen)"
                    value={color.name}
                    onChange={(e) => handleColorChange(idx, 'name', e.target.value)}
                    style={{ width: 140 }}
                    className="text-[13px]"
                  />

                  {/* Color Hex Input */}
                  <Input
                    size="small"
                    placeholder="#1a1a1a"
                    value={color.code}
                    onChange={(e) => handleColorChange(idx, 'code', e.target.value)}
                    style={{ width: 95 }}
                    className="font-mono text-[12px]"
                  />

                  {/* Select ảnh gắn với màu này */}
                  <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#f9f9f9] px-2.5 py-1 rounded-lg border border-[#e8e8e8]">
                    <span className="text-[11px] text-[#777] whitespace-nowrap font-medium">Ảnh của màu:</span>
                    {(() => {
                      const linkedImg = images.find((im) => im.id === color.imageId);
                      return linkedImg ? (
                        <img
                          src={linkedImg.url}
                          alt="Ảnh màu"
                          className="w-7 h-7 rounded-md object-cover border border-[#d9d9d9] shrink-0"
                          title="Ảnh gắn liền với màu này"
                        />
                      ) : (
                        <span className="text-[11px] text-gray-400 italic shrink-0">Chưa chọn</span>
                      );
                    })()}

                    <Select
                      size="small"
                      placeholder="Chọn ảnh..."
                      value={color.imageId || undefined}
                      onChange={(val) => handleColorChange(idx, 'imageId', val)}
                      className="flex-1"
                      allowClear
                    >
                      {images.map((img, i) => (
                        <Option key={img.id} value={img.id}>
                          Ảnh #{i + 1} {i === 0 ? '(Chính)' : ''}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Delete color button */}
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveProductColor(idx)}
                    title="Xóa màu này"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

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

          {product.colors && product.colors.length > 0 && (
            <div>
              <span className="font-semibold block mb-1.5 text-[13px] text-gray-800">Màu sắc ({product.colors.length}):</span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] bg-white border border-[#e0e0e0] shadow-xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: c.code }}
                    />
                    <span className="font-medium text-[#333]">{c.name}</span>
                    <span className="font-mono text-[10px] text-gray-400">{c.code}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

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
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <Input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined className="text-[#ccc]" />}
            size="large"
            allowClear
            className="rounded-xl w-full xl:w-[550px]"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap w-full xl:w-auto">
            {/* Product type filter */}
          <Select
            value={filterType || undefined}
            onChange={(v) => { setFilterType(v || ''); setPage(1); }}
            placeholder="Tất Cả Loại"
            size="large"
            allowClear
            className="w-full sm:w-[150px]"
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
            className="w-full sm:w-[190px]"
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
            className="w-full sm:w-[150px]"
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
