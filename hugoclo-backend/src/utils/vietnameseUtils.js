// ============================================================
// vietnameseUtils.js — Tiện ích xử lý chuỗi tiếng Việt
// ============================================================

/**
 * Loại bỏ dấu tiếng Việt (chuẩn hóa về ký tự không dấu)
 */
const removeVietnameseTones = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

/**
 * Tạo regex pattern tìm kiếm tiếng Việt linh hoạt:
 * Cho phép gõ có dấu hoặc không dấu đều tìm ra kết quả (kể cả chữ hoa/thường).
 * Ví dụ: "ao thun" hoặc "áo thun" đều khớp với "Áo Thun", "áo thun", "ao thun"
 */
const buildVietnameseRegexPattern = (keyword) => {
  if (!keyword || !keyword.trim()) return "";
  const cleanStr = removeVietnameseTones(keyword.trim());
  const escaped = cleanStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const charMap = {
    a: "[aàáảãạăằắẳẵặâầấẩẫậ]",
    e: "[eèéẻẽẹêềếểễệ]",
    i: "[iìíỉĩị]",
    o: "[oòóỏõọôồốổỗộơờớởỡợ]",
    u: "[uùúủũụưừứửữự]",
    y: "[yỳýỷỹỵ]",
    d: "[dđ]",
  };

  let pattern = "";
  for (const char of escaped) {
    const lower = char.toLowerCase();
    if (charMap[lower]) {
      pattern += charMap[lower];
    } else if (/\s/.test(char)) {
      pattern += "\\s+";
    } else {
      pattern += char;
    }
  }

  return pattern;
};

module.exports = {
  removeVietnameseTones,
  buildVietnameseRegexPattern,
};

