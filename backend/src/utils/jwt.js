import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'metruyen-jwt-secret-key-ptit-2026';
const JWT_EXPIRES = process.env.JWT_EXPIRE || process.env.JWT_EXPIRES || '7d';

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default {
  generateToken,
  verifyToken
};