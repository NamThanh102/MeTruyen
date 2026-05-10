import * as authService from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Đăng ký thành công',
    data
  });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Đăng nhập thành công',
    data
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const data = await authService.getUserProfile(req.user._id);
  res.status(200).json({
    success: true,
    statusCode: 200,
    data
  });
});

export default {
  register,
  login,
  getMe
};