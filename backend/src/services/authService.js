import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';

export const registerUser = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw new AppError('Vui lòng cung cấp đầy đủ username, email và password', 400);
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new AppError('Email hoặc username đã được sử dụng', 400);
  }

  const user = await User.create({ username, email, password });
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    token
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Vui lòng nhập email và mật khẩu', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const token = generateToken(user._id);
  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVIP: user.isVIP,
      vipExpireDate: user.vipExpireDate,
      mPoints: user.mPoints,
      avatar: user.avatar,
      displayName: user.displayName
    },
    token
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVIP: user.isVIP,
      vipExpireDate: user.vipExpireDate,
      mPoints: user.mPoints,
      avatar: user.avatar,
      displayName: user.displayName
    }
  };
};

export default {
  registerUser,
  loginUser,
  getUserProfile
};
