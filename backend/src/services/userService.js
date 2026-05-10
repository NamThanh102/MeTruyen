import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Comic from '../models/Comic.js';
import Chapter from '../models/Chapter.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { AppError } from '../middlewares/errorHandler.js';
import mongoose from 'mongoose';

export const getProfile = async (userId) => {
  return User.findById(userId);
};

export const updateProfile = async (userId, data, file) => {
  const { displayName, bio } = data;
  const updateData = {};

  if (displayName) updateData.displayName = displayName;
  if (bio !== undefined) updateData.bio = bio;

  if (file) {
    const result = await uploadToCloudinary(file.buffer, 'metruyen/avatars');
    updateData.avatar = result.url;
  }

  return User.findByIdAndUpdate(userId, updateData, {
    returnDocument: 'after',
    runValidators: true
  }).select('-password');
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new AppError('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('Mật khẩu mới tối thiểu 6 ký tự', 400);
  }

  const user = await User.findById(userId).select('+password');
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new AppError('Mật khẩu hiện tại không chính xác', 401);
  }

  user.password = newPassword;
  await user.save();
  return true;
};

export const toggleBookmark = async (userId, comicId) => {
  if (!comicId) {
    throw new AppError('Comic ID là bắt buộc', 400);
  }

  const user = await User.findById(userId);
  const comic = await Comic.findById(comicId);

  if (!comic) {
    throw new AppError('Truyện không tồn tại', 404);
  }

  const bookmarkIndex = user.library.bookmarks.findIndex(
    (b) => b.comicId.toString() === comicId
  );

  let message;
  if (bookmarkIndex > -1) {
    user.library.bookmarks.splice(bookmarkIndex, 1);
    message = 'Bookmark removed';

    await Comic.findByIdAndUpdate(comicId, {
      $inc: { 'statistics.totalBookmarks': -1 }
    });
  } else {
    user.library.bookmarks.unshift({
      comicId,
      addedAt: Date.now()
    });
    message = 'Bookmark added';

    await Comic.findByIdAndUpdate(comicId, {
      $inc: { 'statistics.totalBookmarks': 1 }
    });
  }

  await user.save();
  return { message, bookmarks: user.library.bookmarks };
};

export const getLibrary = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'library.bookmarks.comicId',
      select: 'title slug coverImage author status statistics'
    })
    .populate({
      path: 'library.history.comicId',
      select: 'title slug coverImage'
    })
    .populate({
      path: 'library.history.chapterId',
      select: 'chapterNumber title'
    });

  return {
    bookmarks: user.library.bookmarks,
    history: user.library.history
  };
};

export const addToHistory = async (userId, { chapterId, comicId, lastReadPage }) => {
  if (!chapterId) {
    throw new AppError('Chapter ID là bắt buộc', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(chapterId)) {
    throw new AppError('Chapter ID không hợp lệ', 400);
  }

  let finalComicId = comicId;
  if (!finalComicId) {
    const chapter = await Chapter.findById(chapterId).select('comicId');
    if (!chapter) {
      throw new AppError('Chapter không tồn tại', 404);
    }
    finalComicId = chapter.comicId;
  }

  if (!mongoose.Types.ObjectId.isValid(finalComicId)) {
    throw new AppError('Comic ID không hợp lệ', 400);
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { 'library.history': { comicId: finalComicId } }
  });

  await User.findByIdAndUpdate(userId, {
    $push: {
      'library.history': {
        $each: [{
          comicId: finalComicId,
          chapterId,
          lastReadPage: lastReadPage || 0,
          lastReadAt: Date.now()
        }],
        $position: 0,
        $slice: 100
      }
    }
  });

  return true;
};

export const rechargeMPoints = async (userId, { amount, paymentMethod, transactionId }) => {
  if (!amount || amount <= 0) {
    throw new AppError('Số tiền không hợp lệ', 400);
  }

  if (!transactionId || transactionId.trim() === '') {
    throw new AppError('Mã giao dịch không được để trống', 400);
  }

  const existing = await Payment.findOne({ transactionId: transactionId.trim() });
  if (existing) {
    throw new AppError('Mã giao dịch đã được sử dụng', 400);
  }

  const payment = await Payment.create({
    userId,
    transactionId: transactionId.trim(),
    amount,
    paymentMethod: paymentMethod || 'bank_transfer',
    status: 'success'
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { mPoints: amount } },
    { returnDocument: 'after' }
  ).select('-password');

  return { payment, newBalance: user.mPoints };
};

export const upgradeVIP = async (userId, { duration, points }) => {
  if (!duration || !points) {
    throw new AppError('Thiếu thông tin gói VIP', 400);
  }

  const validPackages = {
    1: 10000,
    7: 50000,
    30: 150000,
    180: 700000,
    365: 1000000
  };

  if (validPackages[duration] !== points) {
    throw new AppError('Gói VIP không hợp lệ', 400);
  }

  const user = await User.findById(userId);

  if (user.mPoints < points) {
    throw new AppError(`Không đủ M-Point. Cần ${points.toLocaleString('vi-VN')} M-Point`, 400);
  }

  user.mPoints -= points;

  let newExpireDate;
  if (user.isVIP && user.vipExpireDate && user.vipExpireDate > new Date()) {
    newExpireDate = new Date(user.vipExpireDate);
    newExpireDate.setDate(newExpireDate.getDate() + duration);
  } else {
    newExpireDate = new Date();
    newExpireDate.setDate(newExpireDate.getDate() + duration);
  }

  user.isVIP = true;
  user.vipExpireDate = newExpireDate;
  await user.save();

  return {
    vipExpireDate: newExpireDate,
    mPointsSpent: points,
    mPointsRemaining: user.mPoints
  };
};

export const getPlatformStats = async () => {
  const [totalUsers, vipUsers, totalComics, viewStats] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ 
      isVIP: true, 
      vipExpireDate: { $gt: new Date() }
    }),
    Comic.countDocuments(),
    Comic.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$statistics.totalViews' }
        }
      }
    ])
  ]);

  return {
    totalComics,
    totalUsers,
    vipUsers,
    totalViews: viewStats.length > 0 ? viewStats[0].totalViews : 0
  };
};

export const getAllUsers = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const search = queryParams.search || '';
  const role = queryParams.role;

  const query = {};

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } }
    ];
  }

  if (role === 'admin') {
    query.role = 'admin';
  } else if (role === 'vip') {
    query.isVIP = true;
    query.vipExpireDate = { $gt: new Date() };
  } else if (role === 'user') {
    query.role = { $ne: 'admin' };
    query.$or = [
      { isVIP: false },
      { vipExpireDate: { $lte: new Date() } }
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      limit
    }
  };
};

export const updateUserByAdmin = async (userId, data) => {
  const { username, email, displayName, role, isVIP, vipExpireDate, mPoints } = data;
  const updateData = {};

  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (displayName) updateData.displayName = displayName;
  if (role) updateData.role = role;

  if (mPoints !== undefined) {
    if (mPoints < 0) {
      throw new AppError('M-Points cannot be negative', 400);
    }
    updateData.mPoints = mPoints;
  }

  if (isVIP !== undefined) {
    updateData.isVIP = isVIP;
    if (vipExpireDate) {
      updateData.vipExpireDate = new Date(vipExpireDate);
    } else if (!isVIP) {
      updateData.vipExpireDate = null;
    }
  } else if (vipExpireDate) {
    updateData.vipExpireDate = new Date(vipExpireDate);
    updateData.isVIP = true;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    returnDocument: 'after',
    runValidators: true
  }).select('-password');

  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  return user;
};

export const changeUserPasswordByAdmin = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  user.password = newPassword;
  await user.save();
  return true;
};

export const deleteUser = async (userId, currentUserId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  if (user._id.toString() === currentUserId.toString()) {
    throw new AppError('Bạn không thể xóa tài khoản của chính mình', 400);
  }

  await user.deleteOne();
  return true;
};

export const getAdminPayments = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const status = queryParams.status;
  const search = queryParams.search;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [{ transactionId: { $regex: search, $options: 'i' } }];
  }

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query)
  ]);

  return {
    payments,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPayments: total,
      limit
    }
  };
};

export const updateAdminPayment = async (paymentId, status) => {
  const allowed = ['pending', 'success', 'failed', 'refunded'];
  if (!allowed.includes(status)) {
    throw new AppError('Trạng thái không hợp lệ', 400);
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('Không tìm thấy giao dịch', 404);
  }

  payment.status = status;
  if (status === 'success' && !payment.processedAt) {
    payment.processedAt = new Date();
  }
  await payment.save();
  return payment;
};

export const deleteAdminPayment = async (paymentId) => {
  const payment = await Payment.findByIdAndDelete(paymentId);
  if (!payment) {
    throw new AppError('Không tìm thấy giao dịch', 404);
  }
  return true;
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  toggleBookmark,
  getLibrary,
  addToHistory,
  rechargeMPoints,
  upgradeVIP,
  getPlatformStats,
  getAllUsers,
  updateUserByAdmin,
  changeUserPasswordByAdmin,
  deleteUser,
  getAdminPayments,
  updateAdminPayment,
  deleteAdminPayment
};
