import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendWhatsAppOTP, sendWelcomeWhatsApp } from '../utils/twilioWhatsApp.js';

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Step 1: Request OTP for phone number (Registration or Login)
 * If phone exists → Send OTP for login
 * If phone doesn't exist → Send OTP for registration
 */
export const requestPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        message: 'Invalid phone number format. Use E.164 format (e.g., +919876543210)' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ phone });
    const isNewUser = !user;

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (isNewUser) {
      // Create temporary user record with OTP
      user = await User.create({
        phone,
        phoneOtp: otp,
        phoneOtpExpires: otpExpires,
        otpVerified: false,
        name: '', // Will be filled after OTP verification
        email: '', // Optional, can be added later
      });
    } else {
      // Update existing user's OTP
      user.phoneOtp = otp;
      user.phoneOtpExpires = otpExpires;
      await user.save();
    }

    // Send OTP via WhatsApp
    try {
      await sendWhatsAppOTP(phone, otp);
    } catch (twilioError) {
      console.error('Twilio error:', twilioError.message);
      // For development, you can still return success and log OTP
      console.log(`📱 OTP for ${phone}: ${otp}`);
      return res.json({
        message: 'OTP generation successful. Check server logs for OTP (Twilio setup pending)',
        isNewUser,
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }

    res.json({
      message: 'OTP sent successfully via WhatsApp',
      isNewUser, // Frontend needs to know if this is registration or login
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Error in requestPhoneOTP:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Step 2: Verify OTP and complete registration (for new users)
 */
export const verifyOTPAndRegister = async (req, res) => {
  try {
    const { phone, otp, name, role } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    if (!name || !role) {
      return res.status(400).json({ 
        message: 'Name and role are required for registration' 
      });
    }

    if (!['customer', 'provider'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be customer or provider' });
    }

    // Find user by phone and OTP
    const user = await User.findOne({ phone, phoneOtp: otp });

    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check OTP expiration
    if (!user.phoneOtpExpires || user.phoneOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one' });
    }

    // Check if user already completed registration
    if (user.otpVerified && user.name) {
      return res.status(400).json({ 
        message: 'Phone number already registered. Please use login instead' 
      });
    }

    // Update user with registration details
    user.name = name;
    user.role = role;
    user.otpVerified = true;
    user.phoneOtp = undefined; // Clear OTP
    user.phoneOtpExpires = undefined;
    await user.save();

    // Send welcome message
    try {
      await sendWelcomeWhatsApp(phone, name);
    } catch (e) {
      console.log('Welcome message failed (non-critical):', e.message);
    }

    // Generate JWT token
    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        verified: user.otpVerified,
        isAvailable: user.isAvailable || false,
        rating: user.rating || 0,
        completedJobs: user.completedJobs || 0,
        onboardingStatus: user.onboardingStatus || 'pending',
        licenseImage: user.licenseImage,
        licenseType: user.licenseType,
        licenseNumber: user.licenseNumber
      },
      message: 'Registration successful!'
    });
  } catch (error) {
    console.error('Error in verifyOTPAndRegister:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Step 2 (Alternative): Verify OTP and login (for existing users)
 */
export const verifyOTPAndLogin = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // Find user by phone and OTP
    const user = await User.findOne({ phone, phoneOtp: otp });

    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check OTP expiration
    if (!user.phoneOtpExpires || user.phoneOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one' });
    }

    // Check if user has completed registration
    if (!user.otpVerified || !user.name) {
      return res.status(400).json({ 
        message: 'Please complete registration first',
        needsRegistration: true
      });
    }

    // Clear OTP
    user.phoneOtp = undefined;
    user.phoneOtpExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        role: user.role,
        verified: user.otpVerified,
        address: user.address || '',
        isAvailable: user.isAvailable || false,
        rating: user.rating || 0,
        completedJobs: user.completedJobs || 0,
        onboardingStatus: user.onboardingStatus || 'pending',
        licenseImage: user.licenseImage,
        licenseType: user.licenseType,
        licenseNumber: user.licenseNumber,
        verificationReviewedAt: user.verificationReviewedAt,
        verificationSubmittedAt: user.verificationSubmittedAt,
        rejectionReason: user.rejectionReason
      },
      message: 'Login successful!'
    });
  } catch (error) {
    console.error('Error in verifyOTPAndLogin:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Resend OTP (if user didn't receive or it expired)
 */
export const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'Phone number not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.phoneOtp = otp;
    user.phoneOtpExpires = otpExpires;
    await user.save();

    // Send OTP via WhatsApp
    try {
      await sendWhatsAppOTP(phone, otp);
    } catch (twilioError) {
      console.error('Twilio error:', twilioError.message);
      console.log(`📱 OTP for ${phone}: ${otp}`);
      return res.json({
        message: 'OTP regenerated. Check server logs (Twilio setup pending)',
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }

    res.json({
      message: 'OTP resent successfully via WhatsApp',
      expiresIn: 600
    });
  } catch (error) {
    console.error('Error in resendOTP:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  requestPhoneOTP,
  verifyOTPAndRegister,
  verifyOTPAndLogin,
  resendOTP
};
