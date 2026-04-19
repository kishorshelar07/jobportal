const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const Company = require('../models/Company');
const { EmailVerification, PasswordReset } = require('../models/index');
const {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  findRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/jwt');
const { formatResponse, formatError } = require('../utils/formatResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

// ─── Validators ────────────────────────────────────────

const registerValidators = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain letters and numbers'),
  body('role').isIn(['jobseeker', 'recruiter']).withMessage('Role must be jobseeker or recruiter'),
  body('companyName')
    .if(body('role').equals('recruiter'))
    .trim()
    .notEmpty()
    .withMessage('Company name is required for recruiters'),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Generate OTP ──────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Controllers ───────────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName } = req.body;

  // Check duplicate
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Create user
  const user = await User.create({ name, email, password, role });

  // Create profile/company based on role
  if (role === 'jobseeker') {
    await JobSeekerProfile.create({ userId: user._id });
  } else if (role === 'recruiter') {
    await Company.create({ recruiterId: user._id, name: companyName });
  }

  // Generate OTP
  const otp = generateOTP();
  await EmailVerification.deleteMany({ userId: user._id });
  await EmailVerification.create({ userId: user._id, otp });

  // Send email (non-blocking)
  sendVerificationEmail(user, otp).catch(console.error);

  return formatResponse(res, {
    statusCode: 201,
    message: 'Account created! Please verify your email with the OTP sent to your inbox.',
    data: { userId: user._id, email: user.email },
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const record = await EmailVerification.findOne({ userId });
  if (!record) {
    throw new AppError('No pending verification found. Please register again.', 404);
  }
  if (new Date() > record.expiresAt) {
    await EmailVerification.deleteOne({ _id: record._id });
    throw new AppError('OTP has expired. Please request a new one.', 410);
  }
  if (record.otp !== otp) {
    record.attempts += 1;
    await record.save();
    if (record.attempts >= 5) {
      await EmailVerification.deleteOne({ _id: record._id });
      throw new AppError('Too many failed attempts. Please request a new OTP.', 429);
    }
    throw new AppError(`Invalid OTP. ${5 - record.attempts} attempts remaining.`, 400);
  }

  await User.findByIdAndUpdate(userId, { isVerified: true });
  await EmailVerification.deleteOne({ _id: record._id });

  return formatResponse(res, {
    message: 'Email verified successfully! You can now log in.',
    data: {},
  });
});

const resendOTP = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  if (user.isVerified) throw new AppError('Account is already verified.', 400);

  const otp = generateOTP();
  await EmailVerification.deleteMany({ userId: user._id });
  await EmailVerification.create({ userId: user._id, otp });
  sendVerificationEmail(user, otp).catch(console.error);

  return formatResponse(res, { message: 'New OTP sent to your email.', data: {} });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }
  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(user._id, refreshToken, req.ip);
  setRefreshTokenCookie(res, refreshToken);

  return formatResponse(res, {
    message: 'Login successful.',
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    },
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token not found.', 401);

  const storedToken = await findRefreshToken(token);
  if (!storedToken) throw new AppError('Invalid or expired refresh token.', 401);

  const user = storedToken.userId;
  if (!user || !user.isActive) throw new AppError('User not found or deactivated.', 401);

  // Rotate refresh token
  await revokeRefreshToken(token);
  const newRefreshToken = generateRefreshToken();
  await saveRefreshToken(user._id, newRefreshToken, req.ip);
  setRefreshTokenCookie(res, newRefreshToken);

  const accessToken = generateAccessToken({ id: user._id, role: user.role });

  return formatResponse(res, {
    message: 'Token refreshed.',
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await revokeRefreshToken(token);
  }
  clearRefreshTokenCookie(res);
  return formatResponse(res, { message: 'Logged out successfully.', data: {} });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same to prevent enumeration
  const successMsg = 'If an account exists with that email, a reset link has been sent.';
  if (!user) return formatResponse(res, { message: successMsg, data: {} });

  const token = uuidv4();
  await PasswordReset.deleteMany({ userId: user._id });
  await PasswordReset.create({ userId: user._id, token });

  sendPasswordResetEmail(user, token).catch(console.error);

  return formatResponse(res, { message: successMsg, data: {} });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const resetRecord = await PasswordReset.findOne({
    token,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    throw new AppError('Invalid or expired reset link. Please request a new one.', 400);
  }

  const user = await User.findById(resetRecord.userId);
  if (!user) throw new AppError('User not found.', 404);

  user.password = password;
  await user.save();

  resetRecord.isUsed = true;
  await resetRecord.save();

  // Revoke all existing refresh tokens
  const { RefreshToken } = require('../models/index');
  await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

  return formatResponse(res, {
    message: 'Password reset successful. Please log in with your new password.',
    data: {},
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return formatResponse(res, { data: { user: user.toSafeObject() } });
});

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  registerValidators,
  loginValidators,
};
