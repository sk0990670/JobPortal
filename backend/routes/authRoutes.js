const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const { register, login, getMe, logout, changePassword, verifyOTP, resendOTP, registerAdmin, generate2FA, verify2FA, disable2FA, verify2FALogin, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { sendTokenResponse } = require('../utils/generateToken');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for sensitive auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
});

/* ────────────────────────────────────────
   Email / Password routes
──────────────────────────────────────── */
router.post('/register', authLimiter, [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], register);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], login);

router.get('/me',             protect, getMe);
router.post('/logout',          protect, logout);
router.put( '/change-password', protect, changePassword);

// OTP verification
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);

// 2FA Routes
router.get('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/verify-2fa-login', authLimiter, verify2FALogin);

// Password Reset Routes
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

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
    const token = req.user.getSignedJwtToken
      ? req.user.getSignedJwtToken()
      : require('jsonwebtoken').sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

/* ────────────────────────────────────────
   LinkedIn OAuth routes
──────────────────────────────────────── */

// Step 1 — Redirect to LinkedIn consent screen
router.get(
  '/linkedin',
  passport.authenticate('linkedin', { session: false, state: 'some_random_state_string' })
);

// Step 2 — LinkedIn redirects back here with auth code
router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=linkedin_failed` }),
  (req, res) => {
    const token = req.user.getSignedJwtToken
      ? req.user.getSignedJwtToken()
      : require('jsonwebtoken').sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
