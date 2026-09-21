const cron = require('node-cron');
const Order = require('../models/Order');

/**
 * Cleanup / Archive cancelled orders older than 30 days
 * Runs every day at 02:00 AM
 */
const startOrderArchivingCron = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('[CRON] Bắt đầu dọn dẹp đơn hàng hủy tồn đọng...');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Order.updateMany(
        {
          orderStatus: 'cancelled',
          updatedAt: { $lt: thirtyDaysAgo },
          isArchived: false
        },
        {
          $set: { isArchived: true }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[CRON] Đã lưu trữ (archive) ${result.modifiedCount} đơn hàng hủy quá 30 ngày.`);
      }
    } catch (error) {
      console.error('[CRON] Lỗi khi dọn dẹp đơn hàng hủy:', error);
    }
  });
  
  console.log('[CRON] Đã lên lịch tự động lưu trữ đơn hủy lúc 02:00 mỗi ngày.');
};

module.exports = { startOrderArchivingCron };
