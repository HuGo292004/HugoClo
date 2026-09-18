// ============================================================
// VNPay Service — Tạo URL thanh toán & xác minh callback
// Sandbox credentials từ VNPay developer portal
// Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
// ============================================================

const crypto = require("crypto");
const qs = require("qs");

const VNPAY_CONFIG = {
  tmnCode:    process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  url:        process.env.VNPAY_URL,
  returnUrl:  process.env.VNPAY_RETURN_URL,
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} params
 * @param {string} params.orderId   - ID đơn hàng MongoDB
 * @param {number} params.amount    - Số tiền (VND)
 * @param {string} params.orderInfo - Mô tả đơn hàng
 * @param {string} params.ipAddr    - IP người dùng
 * @returns {string} URL redirect đến VNPay
 */
const createPaymentUrl = ({ orderId, amount, orderInfo, ipAddr }) => {
  const date   = new Date();
  const pad    = (n, l = 2) => String(n).padStart(l, "0");
  const createDate = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");

  // VNPay yêu cầu amount * 100
  const vnpAmount = amount * 100;

  const params = {
    vnp_Version:    "2.1.0",
    vnp_Command:    "pay",
    vnp_TmnCode:    VNPAY_CONFIG.tmnCode,
    vnp_Locale:     "vn",
    vnp_CurrCode:   "VND",
    vnp_TxnRef:     orderId,
    vnp_OrderInfo:  orderInfo || `Thanh toán đơn hàng ${orderId}`,
    vnp_OrderType:  "other",
    vnp_Amount:     vnpAmount,
    vnp_ReturnUrl:  VNPAY_CONFIG.returnUrl,
    vnp_IpAddr:     ipAddr || "127.0.0.1",
    vnp_CreateDate: createDate,
  };

  // Sắp xếp key theo alphabet (VNPay yêu cầu) và encode
  const sortedParams = sortObject(params);
  const signData     = qs.stringify(sortedParams, { encode: false });
  const hmac         = crypto.createHmac("sha512", VNPAY_CONFIG.hashSecret);
  const signed       = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  sortedParams.vnp_SecureHash = signed;
  const paymentUrl = `${VNPAY_CONFIG.url}?${qs.stringify(sortedParams, { encode: false })}`;

  return paymentUrl;
};

/**
 * Xác minh chữ ký từ VNPay callback
 * @param {Object} vnpParams - Query params từ VNPay return URL
 * @returns {{ isValid: boolean, responseCode: string }}
 */
const verifyReturnUrl = (vnpParams) => {
  const secureHash = vnpParams.vnp_SecureHash;
  const params     = { ...vnpParams };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sortedParams = sortObject(params);
  const signData     = qs.stringify(sortedParams, { encode: false });
  const hmac         = crypto.createHmac("sha512", VNPAY_CONFIG.hashSecret);
  const signed       = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return {
    isValid:      signed === secureHash,
    responseCode: vnpParams.vnp_ResponseCode,
    orderId:      vnpParams.vnp_TxnRef,
    transactionId: vnpParams.vnp_TransactionNo,
  };
};

module.exports = { createPaymentUrl, verifyReturnUrl };
