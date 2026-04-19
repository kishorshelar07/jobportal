const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');
const { protect } = require('../../middleware/auth');
const { body } = require('express-validator');
const {
  register, verifyEmail, resendOTP, login, refreshToken,
  logout, forgotPassword, resetPassword, getMe,
  registerValidators, loginValidators,
} = require('../../controllers/auth.controller');

router.post('/register', authLimiter, registerValidators, validate, register);
router.post('/verify-email', [
  body('userId').notEmpty().withMessage('userId is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], validate, verifyEmail);
router.post('/resend-otp', [
  body('userId').notEmpty().withMessage('userId is required'),
], validate, resendOTP);
router.post('/login', authLimiter, loginValidators, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
], validate, forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain letters and numbers'),
], validate, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
