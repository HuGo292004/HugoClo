// ============================================================
// colorThiefUtils.js — Trích xuất màu từ ảnh bằng ColorThief
// Tự động map sang tên màu tiếng Việt thông dụng
// ============================================================

import { getColor, getPalette } from 'colorthief';

// Danh mục màu cơ bản để tìm tên màu tiếng Việt gần nhất
const VIETNAMESE_COLORS = [
  { name: 'Đen',          hex: '#000000' },
  { name: 'Đen',          hex: '#1a1a1a' },
  { name: 'Trắng',        hex: '#ffffff' },
  { name: 'Trắng kem',    hex: '#fdfbf7' },
  { name: 'Trắng xám',    hex: '#f3f4f6' },
  { name: 'Xám nhạt',     hex: '#d1d5db' },
  { name: 'Xám',          hex: '#9ca3af' },
  { name: 'Xám đậm',      hex: '#4b5563' },
  { name: 'Xám than',     hex: '#374151' },
  { name: 'Be',           hex: '#d4b896' },
  { name: 'Be sáng',      hex: '#f5ebe0' },
  { name: 'Kem',          hex: '#fff8dc' },
  { name: 'Nâu nhạt',     hex: '#b58d67' },
  { name: 'Nâu bò',       hex: '#a0522d' },
  { name: 'Nâu',          hex: '#78350f' },
  { name: 'Nâu đất',      hex: '#5c3a21' },
  { name: 'Nâu socola',   hex: '#3e2723' },
  { name: 'Đỏ tươi',      hex: '#ef4444' },
  { name: 'Đỏ',           hex: '#dc2626' },
  { name: 'Đỏ đô',        hex: '#881337' },
  { name: 'Đỏ rượu vang', hex: '#722f37' },
  { name: 'Hồng phấn',    hex: '#fbcfe8' },
  { name: 'Hồng',         hex: '#f472b6' },
  { name: 'Hồng đất',     hex: '#c47a5a' },
  { name: 'Cam',          hex: '#ea580c' },
  { name: 'Cam đất',      hex: '#c2410c' },
  { name: 'Vàng nhạt',    hex: '#fef08a' },
  { name: 'Vàng',         hex: '#eab308' },
  { name: 'Vàng mù tạt',  hex: '#d97706' },
  { name: 'Xanh rêu',     hex: '#4d7c0f' },
  { name: 'Xanh ô liu',   hex: '#556b2f' },
  { name: 'Xanh lá',      hex: '#16a34a' },
  { name: 'Xanh bơ',      hex: '#84cc16' },
  { name: 'Xanh mint',    hex: '#6ee7b7' },
  { name: 'Xanh da trời', hex: '#38bdf8' },
  { name: 'Xanh dương nhạt', hex: '#93c5fd' },
  { name: 'Xanh dương',   hex: '#2563eb' },
  { name: 'Xanh Navy',    hex: '#1e3a5f' },
  { name: 'Xanh than',    hex: '#0f172a' },
  { name: 'Tím pastel',   hex: '#d8b4fe' },
  { name: 'Tím',          hex: '#9333ea' },
  { name: 'Tím than',     hex: '#3b0764' },
];

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(
    clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean,
    16
  );
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

/**
 * Tìm tên màu tiếng Việt gần nhất dựa trên khoảng cách RGB
 */
export const getClosestColorName = (hex) => {
  if (!hex || typeof hex !== 'string') return 'Màu tùy chọn';
  try {
    const { r, g, b } = hexToRgb(hex);
    let closestName = 'Màu tùy chọn';
    let minDistance = Infinity;

    for (const item of VIETNAMESE_COLORS) {
      const target = hexToRgb(item.hex);
      const dist = Math.sqrt(
        Math.pow(r - target.r, 2) +
        Math.pow(g - target.g, 2) +
        Math.pow(b - target.b, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestName = item.name;
      }
    }
    return closestName;
  } catch {
    return 'Màu tùy chọn';
  }
};

/**
 * Trích xuất bảng màu từ ảnh (URL string hoặc File/Blob)
 * Trả về mảng các object: [{ name: 'Nâu đất', code: '#5c3a21' }, ...]
 */
export const extractColorsFromImage = (imageSource, maxColors = 4) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = null;

    const cleanup = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };

    const handleSuccess = async () => {
      try {
        const palette = await getPalette(img, { colorCount: maxColors, quality: 5 });
        const hexList = [];

        if (palette && palette.length > 0) {
          palette.forEach((c) => {
            const hex = typeof c.hex === 'function' ? c.hex() : String(c);
            if (hex && !hexList.includes(hex.toLowerCase())) {
              hexList.push(hex.toLowerCase());
            }
          });
        } else {
          const dom = await getColor(img);
          if (dom) {
            const hex = typeof dom.hex === 'function' ? dom.hex() : String(dom);
            if (hex) hexList.push(hex.toLowerCase());
          }
        }

        cleanup();

        const colorObjects = hexList.map((hex) => ({
          name: getClosestColorName(hex),
          code: hex,
        }));

        resolve(colorObjects);
      } catch (err) {
        cleanup();
        console.warn('ColorThief extraction warning:', err);
        resolve([]);
      }
    };

    img.onload = handleSuccess;
    img.onerror = () => {
      cleanup();
      resolve([]);
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      objectUrl = URL.createObjectURL(imageSource);
      img.src = objectUrl;
    } else {
      resolve([]);
    }
  });
};
