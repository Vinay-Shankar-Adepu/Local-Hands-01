import express from 'express';
import {
  requestPhoneOTP,
  verifyOTPAndRegister,
  verifyOTPAndLogin,
  resendOTP
} from '../controllers/mobileAuthController.js';

const router = express.Router();

/**
 * @route   POST /api/mobile-auth/request-otp
 * @desc    Request OTP via WhatsApp for phone number
 * @access  Public
 * @body    { phone: "+919876543210" }
 */
router.post('/request-otp', requestPhoneOTP);

/**
 * @route   POST /api/mobile-auth/verify-register
 * @desc    Verify OTP and complete registration (new users)
 * @access  Public
 * @body    { phone: "+919876543210", otp: "123456", name: "John Doe", role: "customer" }
 */
router.post('/verify-register', verifyOTPAndRegister);

/**
 * @route   POST /api/mobile-auth/verify-login
 * @desc    Verify OTP and login (existing users)
 * @access  Public
 * @body    { phone: "+919876543210", otp: "123456" }
 */
router.post('/verify-login', verifyOTPAndLogin);

/**
 * @route   POST /api/mobile-auth/resend-otp
 * @desc    Resend OTP to phone number
 * @access  Public
 * @body    { phone: "+919876543210" }
 */
router.post('/resend-otp', resendOTP);

export default router;
