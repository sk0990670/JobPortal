const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailService');

/* ── Helper: generate 6-digit OTP ── */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register new user  → sends OTP email
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.isVerified) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  const otp        = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  let user;
  if (existingUser && !existingUser.isVerified) {
    // Resend OTP to unverified account
    existingUser.otp        = otp;
    existingUser.otpExpires = otpExpires;
    existingUser.password   = password; // re-hash via pre-save hook
    await existingUser.save();
    user = existingUser;
  } else {
    user = await User.create({
      fullName, email, password,
      role: 'user',
      isVerified: false,
      otp, otpExpires,
    });
  }

  // Send OTP email
  try {
    await sendOTPEmail(email, fullName, otp);
  } catch (err) {
    // Don't block registration if email fails — log it
    console.error('OTP email failed:', err.message);
  }

  res.status(201).json({
    success: true,
    message: `OTP sent to ${email}. Please verify to activate your account.`,
    email, // send back so frontend can pre-fill the verify page
  });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required.');
  }

  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) {
    res.status(404);
    throw new Error('No account found with this email.');
  }

  if (!user.otp || !user.otpExpires) {
    res.status(400);
    throw new Error('No OTP was requested. Please sign up again.');
  }

  if (new Date() > user.otpExpires) {
    res.status(400);
    throw new Error('OTP has expired. Please sign up again to get a new OTP.');
  }

  if (user.otp !== otp.toString()) {
    res.status(400);
    throw new Error('Invalid OTP. Please try again.');
  }

  // Mark verified and clear OTP
  user.isVerified = true;
  user.otp        = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Email verified successfully! Welcome to JobPortal. 🎉');
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required.'); }

  const user = await User.findOne({ email });
  if (!user) { res.status(404); throw new Error('No account found with this email.'); }
  if (user.isVerified && !user.settings?.twoFactorAuth) { res.status(400); throw new Error('This account is already verified and 2FA is not enabled.'); }

  const otp        = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otp        = otp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  console.log(`\n\n=== Resend OTP for ${email}: ${otp} ===\n\n`);

  try {
    await sendOTPEmail(email, user.fullName, otp);
  } catch (err) {
    console.error('Email sending failed:', err.message);
  }

  res.json({ success: true, message: `New OTP sent to ${email}.` });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  // Block unverified users
  if (!user.isVerified) {
    res.status(403);
    throw new Error('Please verify your email first. Check your inbox for the OTP.');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account has been deactivated. Please contact support.');
  }

  // 2FA Check
  if (user.settings?.twoFactorAuth) {
    return res.json({
      success: true,
      requires2FA: true,
      message: 'Two-factor authentication required. Please enter your authenticator code.',
      email: user.email,
    });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Logged in successfully.');
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('savedJobs', 'title company location jobType salary')
    .populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'name logo isVerified' },
    });

  res.json({ success: true, data: user });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password.');
  }
  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('New password must be at least 8 characters.');
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password changed successfully.');
});

// @desc    Register Admin (requires x-admin-secret header)
// @route   POST /api/auth/register-admin
// @access  Secret key protected
const registerAdmin = asyncHandler(async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(403);
    throw new Error('Forbidden: Invalid admin secret.');
  }

  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please provide fullName, email and password.');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  // Admin accounts are auto-verified — no OTP needed
  const admin = await User.create({ fullName, email, password, role: 'admin', isVerified: true });
  sendTokenResponse(admin, 201, res, 'Admin account created successfully.');
});

// @desc    Generate 2FA secret and QR code
// @route   GET /api/auth/2fa/generate
// @access  Private
const generate2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  const secret = speakeasy.generateSecret({
    name: `JobPortal:${user.email}`,
    issuer: 'JobPortal'
  });

  user.settings.twoFactorSecret = secret.base32;
  await user.save({ validateBeforeSave: false });

  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) {
      res.status(500);
      throw new Error('Error generating QR code');
    }

    res.json({
      success: true,
      qrCodeUrl: data_url,
      secret: secret.base32
    });
  });
});

// @desc    Verify 2FA token to enable
// @route   POST /api/auth/2fa/verify
// @access  Private
const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);

  const verified = speakeasy.totp.verify({
    secret: user.settings.twoFactorSecret,
    encoding: 'base32',
    token
  });

  if (verified) {
    user.settings.twoFactorAuth = true;
    await user.save({ validateBeforeSave: false });
    
    res.json({ success: true, message: 'Two-factor authentication enabled successfully.' });
  } else {
    res.status(400);
    throw new Error('Invalid authentication code.');
  }
});

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  user.settings.twoFactorAuth = false;
  user.settings.twoFactorSecret = null;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Two-factor authentication disabled.' });
});

// @desc    Verify 2FA login
// @route   POST /api/auth/verify-2fa-login
// @access  Public
const verify2FALogin = asyncHandler(async (req, res) => {
  const { email, token } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !user.settings?.twoFactorAuth) {
    res.status(400);
    throw new Error('Invalid request or 2FA not enabled.');
  }

  const verified = speakeasy.totp.verify({
    secret: user.settings.twoFactorSecret,
    encoding: 'base32',
    token
  });

  if (!verified) {
    res.status(400);
    throw new Error('Invalid authenticator code.');
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Logged in successfully.');
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found with that email address.');
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  await user.save({ validateBeforeSave: false });

  console.log(`\n\n=== Password Reset OTP for ${email}: ${otp} ===\n\n`);

  try {
    await sendOTPEmail(email, user.fullName, otp);
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }

  res.json({ success: true, message: 'Password reset OTP sent to your email.' });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email }).select('+password +otp +otpExpires');
  if (!user || !user.otp || !user.otpExpires) {
    res.status(400);
    throw new Error('Invalid or expired OTP.');
  }

  if (new Date() > user.otpExpires) {
    res.status(400);
    throw new Error('OTP has expired.');
  }

  if (user.otp !== otp.toString()) {
    res.status(400);
    throw new Error('Invalid OTP.');
  }

  const isSamePassword = await user.matchPassword(password);
  if (isSamePassword) {
    res.status(400);
    throw new Error('Please add a new password. This is your old password.');
  }

  user.password = password;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password has been reset successfully.' });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
  verifyOTP,
  resendOTP,
  changePassword,
  registerAdmin,
  generate2FA,
  verify2FA,
  disable2FA,
  verify2FALogin,
  forgotPassword,
  resetPassword
};
