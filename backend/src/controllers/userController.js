import * as userService from '../services/userService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Profile retrieved successfully',
    data: { user }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body, req.file);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Profile updated successfully',
    data: { user }
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Password changed successfully'
  });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { message, bookmarks } = await userService.toggleBookmark(
    req.user._id,
    req.params.comicId || req.body.comicId
  );
  res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data: { bookmarks }
  });
});

export const getLibrary = asyncHandler(async (req, res) => {
  const data = await userService.getLibrary(req.user._id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Library retrieved successfully',
    data
  });
});

export const addToHistory = asyncHandler(async (req, res) => {
  await userService.addToHistory(req.user._id, {
    chapterId: req.params.chapterId || req.body.chapterId,
    comicId: req.body.comicId,
    lastReadPage: req.body.lastReadPage
  });
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Added to reading history'
  });
});

export const rechargeMPoints = asyncHandler(async (req, res) => {
  const data = await userService.rechargeMPoints(req.user._id, req.body);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: `Nạp ${req.body.amount.toLocaleString('vi-VN')} M-Point thành công`,
    data
  });
});

export const upgradeVIP = asyncHandler(async (req, res) => {
  const data = await userService.upgradeVIP(req.user._id, req.body);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: `Nâng cấp VIP thành công! Có hiệu lực đến ${data.vipExpireDate.toLocaleDateString('vi-VN')}`,
    data
  });
});

export const getStats = asyncHandler(async (req, res) => {
  const data = await userService.getPlatformStats();
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Stats retrieved successfully',
    data
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getAllUsers(req.query);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Users retrieved successfully',
    data: { users, pagination }
  });
});

export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await userService.updateUserByAdmin(req.params.userId, req.body);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'User updated successfully',
    data: { user }
  });
});

export const changeUserPasswordByAdmin = asyncHandler(async (req, res) => {
  await userService.changeUserPasswordByAdmin(req.params.userId, req.body.newPassword);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Password changed successfully'
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.userId, req.user._id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'User deleted successfully'
  });
});

export const getAdminPayments = asyncHandler(async (req, res) => {
  const { payments, pagination } = await userService.getAdminPayments(req.query);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Payments retrieved',
    data: { payments, pagination }
  });
});

export const updateAdminPayment = asyncHandler(async (req, res) => {
  const payment = await userService.updateAdminPayment(req.params.paymentId, req.body.status);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Cập nhật trạng thái thành công',
    data: { payment }
  });
});

export const deleteAdminPayment = asyncHandler(async (req, res) => {
  await userService.deleteAdminPayment(req.params.paymentId);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Đã xóa giao dịch thành công'
  });
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  toggleBookmark,
  getLibrary,
  addToHistory,
  rechargeMPoints,
  upgradeVIP,
  getStats,
  getAllUsers,
  updateUserByAdmin,
  changeUserPasswordByAdmin,
  deleteUser,
  getAdminPayments,
  updateAdminPayment,
  deleteAdminPayment
};
