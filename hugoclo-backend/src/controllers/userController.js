// ============================================================
// userController.js — CRUD profile cho user đang đăng nhập
// ============================================================

const User     = require('../models/User');
const bcrypt   = require('bcryptjs');

// ── GET /api/user/profile ───────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ── PUT /api/user/profile ───────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, gender, dob } = req.body;

    // Validate fullName
    if (fullName !== undefined && !fullName.trim()) {
      return res.status(400).json({ message: 'Họ tên không được để trống' });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (phone     !== undefined) updateData.phone    = phone.trim();
    if (gender    !== undefined) updateData.gender   = gender;
    if (dob       !== undefined) updateData.dob      = dob ? new Date(dob) : null;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.json({ message: 'Cập nhật thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ── PUT /api/user/change-password ───────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ── POST /api/user/avatar ───────────────────────────────────
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file ảnh' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    user.avatar = req.file.path;
    await user.save();

    res.json({ message: 'Cập nhật ảnh đại diện thành công', avatar: user.avatar, user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ── GET /api/user/admin/all (Admin only) ────────────────────
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // ── Build match filter ─────────────────────────────────────
    const matchStage = {};
    if (search) {
      matchStage.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
        { phone:    { $regex: search, $options: 'i' } },
      ];
    }
    if (role   && role   !== 'all') matchStage.role     = role;
    if (status === 'active')        matchStage.isActive = true;
    if (status === 'blocked')       matchStage.isActive = false;

    const sortField = ['createdAt', 'fullName', 'totalSpent'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDir   = sortOrder === 'asc' ? 1 : -1;
    const skipN     = (Number(page) - 1) * Number(limit);
    const limitN    = Number(limit);

    // ── Aggregation pipeline ───────────────────────────────────
    // Tính totalSpent động:
    //   Đơn được tính khi:
    //     (orderStatus = 'delivered') HOẶC (paymentStatus = 'paid')
    //     VÀ orderStatus != 'cancelled'
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders',
          let:  { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $ne: ['$orderStatus', 'cancelled'] },
                    {
                      $or: [
                        { $eq: ['$orderStatus',   'delivered'] },
                        { $eq: ['$paymentStatus', 'paid']      },
                      ],
                    },
                  ],
                },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
          as: 'spentData',
        },
      },
      {
        $addFields: {
          totalSpent: {
            $ifNull: [{ $arrayElemAt: ['$spentData.total', 0] }, 0],
          },
        },
      },
      { $project: { password: 0, spentData: 0 } },
      { $sort: { [sortField]: sortDir } },
      {
        $facet: {
          data:  [{ $skip: skipN }, { $limit: limitN }],
          count: [{ $count: 'total' }],
        },
      },
    ];

    const [result] = await User.aggregate(pipeline);
    const users = result.data || [];
    const total = result.count[0]?.total || 0;

    // ── Thống kê tổng quan ─────────────────────────────────────
    const [totalAll, totalActive, totalBlocked, totalAdmin] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: 'admin' }),
    ]);

    res.json({
      users,
      total,
      totalPages: Math.ceil(total / limitN) || 1,
      page: Number(page),
      stats: { totalAll, totalActive, totalBlocked, totalAdmin },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ── PUT /api/user/admin/:id/role (Admin only) ────────────────
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể thay đổi role của chính mình' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Cập nhật role thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ── PATCH /api/user/admin/:id/status (Admin only) ─────────────
const toggleUserStatus = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể khoá tài khoản của chính mình' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    user.isActive = !user.isActive;
    await user.save();
    const updated = await User.findById(req.params.id).select('-password');
    res.json({
      message: user.isActive ? 'Đã mở khoá tài khoản' : 'Đã khoá tài khoản',
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ── DELETE /api/user/admin/:id (Admin only) ──────────────────
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể xoá tài khoản của chính mình' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Đã xoá người dùng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, uploadAvatar, getAllUsers, updateUserRole, toggleUserStatus, deleteUser };
