// ============================================================
// HugoClo — Product & Category Data
// ============================================================

import product1 from '../assets/product_1.png';
import product2 from '../assets/product_2.png';
import product3 from '../assets/product_3.png';
import product4 from '../assets/product_4.png';
import product5 from '../assets/product_5.png';
import product6 from '../assets/product_6.png';
import product7 from '../assets/product_7.png';
import product8 from '../assets/product_8.png';

import categoryMen from '../assets/category_men.png';
import categoryWomen from '../assets/category_women.png';
import categoryNew from '../assets/category_new.png';
import categorySale from '../assets/category_sale.png';

export const CATEGORIES = [
  {
    id: 1,
    key: 'men',
    label: 'Nam',
    image: categoryMen,
    isSale: false,
  },
  {
    id: 2,
    key: 'women',
    label: 'Nữ',
    image: categoryWomen,
    isSale: false,
  },
  {
    id: 3,
    key: 'new',
    label: 'Hàng Mới',
    image: categoryNew,
    isSale: false,
  },
  {
    id: 4,
    key: 'sale',
    label: 'Sale',
    image: categorySale,
    isSale: true,
  },
];

export const PRODUCTS = [
  {
    id: 1,
    name: 'Áo Thun Oversized Thuần Màu',
    image: product1,
    rating: 4.8,
    reviewCount: 124,
    price: 320000,
    originalPrice: 420000,
    isOnSale: true,
    category: 'unisex',
  },
  {
    id: 2,
    name: 'Quần Ống Rộng Linen Cao Cấp',
    image: product2,
    rating: 4.7,
    reviewCount: 89,
    price: 580000,
    originalPrice: 780000,
    isOnSale: true,
    category: 'women',
  },
  {
    id: 3,
    name: 'Blazer Minimal Dáng Suông',
    image: product3,
    rating: 4.9,
    reviewCount: 201,
    price: 950000,
    originalPrice: null,
    isOnSale: false,
    category: 'unisex',
  },
  {
    id: 4,
    name: 'Chân Váy Midi Lụa Nhẹ',
    image: product4,
    rating: 4.6,
    reviewCount: 67,
    price: 450000,
    originalPrice: 590000,
    isOnSale: true,
    category: 'women',
  },
  {
    id: 5,
    name: 'Quần Chinos Slim Fit',
    image: product5,
    rating: 4.5,
    reviewCount: 143,
    price: 490000,
    originalPrice: null,
    isOnSale: false,
    category: 'men',
  },
  {
    id: 6,
    name: 'Áo Sơ Mi Linen Trắng Tinh',
    image: product6,
    rating: 4.8,
    reviewCount: 312,
    price: 380000,
    originalPrice: 480000,
    isOnSale: true,
    category: 'men',
  },
  {
    id: 7,
    name: 'Cardigan Cropped Hồng Đất',
    image: product7,
    rating: 4.7,
    reviewCount: 55,
    price: 520000,
    originalPrice: null,
    isOnSale: false,
    category: 'women',
  },
  {
    id: 8,
    name: 'Túi Tote Tối Giản Da PU',
    image: product8,
    rating: 4.9,
    reviewCount: 88,
    price: 680000,
    originalPrice: 850000,
    isOnSale: true,
    category: 'unisex',
  },
];

export const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
