const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { RefreshToken } = require('../models/index');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

const generateRefreshToken = () => uuidv4();

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const saveRefreshToken = async (userId, token, ip) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await RefreshToken.create({ userId, token, expiresAt, createdByIp: ip });
};

const revokeRefreshToken = async (token) => {
  await RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
};

const findRefreshToken = async (token) => {
  return RefreshToken.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).populate('userId');
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  saveRefreshToken,
  revokeRefreshToken,
  findRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
