const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const { register, login, getMe, logout, changePassword, verifyOTP, resendOTP, registerAdmin, generate2FA, verify2FA, disable2FA, verify2FALogin, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { sendTokenResponse } = require('../utils/generateToken');

const router = express.Router();

/* ────────────────────────────────────────
   Email / Password routes
──────────────────────────────────────── */
router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], login);

router.get('/me',             protect, getMe);
router.post('/logout',          protect, logout);
router.put( '/change-password', protect, changePassword);

// OTP verification
router.post('/verify-otp',  verifyOTP);
router.post('/resend-otp',  resendOTP);

// 2FA Routes
router.get('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/verify-2fa-login', verify2FALogin);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin creation (requires x-admin-secret header)
router.post('/register-admin', registerAdmin);

/* ────────────────────────────────────────
   Google OAuth routes
──────────────────────────────────────── */

// Step 1 — Redirect to Google consent screen
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Step 2 — Google redirects back here with auth code
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    // Generate JWT for the authenticated user
    const token = req.user.getSignedJwtToken
      ? req.user.getSignedJwtToken()
      : require('jsonwebtoken').sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    // Redirect to frontend with token in URL (frontend reads it once and stores in localStorage)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
