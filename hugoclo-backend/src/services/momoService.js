// ============================================================
// MoMo Service — Tạo URL thanh toán & xác minh callback
// Sandbox environment: https://developers.momo.vn/#/
// ============================================================

const crypto = require("crypto");
const axios  = require("axios");

const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey:   process.env.MOMO_ACCESS_KEY   || "F8BBA842ECF85",
  secretKey:   process.env.MOMO_SECRET_KEY   || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint:    process.env.MOMO_ENDPOINT     || "https://test-payment.momo.vn/v2/gateway/api/create",
  returnUrl:   "http://localhost:5000/api/orders/momo-return",
  notifyUrl:   "http://localhost:5000/api/orders/momo-ipn",
};

/**
 * Tạo request thanh toán MoMo
 * @param {Object} params
 * @param {string} params.orderId   - ID đơn hàng
 * @param {number} params.amount    - Số tiền (VND)
 * @param {string} params.orderInfo - Mô tả đơn hàng
 * @returns {Promise<string>} URL redirect đến MoMo
 */
const createPaymentUrl = async ({ orderId, amount, orderInfo }) => {
  const requestId = `${orderId}_${Date.now()}`;
  const requestType = "payWithMethod";
  const extraData   = "";

  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${MOMO_CONFIG.notifyUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo || `Thanh toan don hang ${orderId}`}`,
    `partnerCode=${MOMO_CONFIG.partnerCode}`,
    `redirectUrl=${MOMO_CONFIG.returnUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  const body = {
    partnerCode: MOMO_CONFIG.partnerCode,
    accessKey:   MOMO_CONFIG.accessKey,
    requestId,
    amount:      String(amount),
    orderId,
    orderInfo:   orderInfo || `Thanh toan don hang ${orderId}`,
    redirectUrl: MOMO_CONFIG.returnUrl,
    ipnUrl:      MOMO_CONFIG.notifyUrl,
    extraData,
    requestType,
    signature,
    lang: "vi",
  };

  const response = await axios.post(MOMO_CONFIG.endpoint, body, {
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
  });

  if (response.data.resultCode !== 0) {
    throw new Error(response.data.message || "MoMo payment creation failed");
  }

  return response.data.payUrl;
};

/**
 * Xác minh chữ ký IPN từ MoMo
 * @param {Object} body - Request body từ MoMo IPN
 * @returns {{ isValid: boolean }}
 */
const verifyIPN = (body) => {
  const {
    partnerCode, orderId, requestId, amount, orderInfo,
    orderType, transId, resultCode, message, payType,
    responseTime, extraData, signature,
  } = body;

  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType}`,
    `partnerCode=${partnerCode}`,
    `payType=${payType}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`,
  ].join("&");

  const computed = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  return {
    isValid:       computed === signature,
    resultCode:    Number(resultCode),
    transactionId: String(transId),
    orderId,
  };
};

module.exports = { createPaymentUrl, verifyIPN };
