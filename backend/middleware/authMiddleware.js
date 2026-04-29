const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - JWT authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('User no longer exists.');
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error('Account has been deactivated. Please contact support.');
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      res.status(401);
      throw new Error('Password was recently changed. Please log in again.');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Invalid or expired token. Please log in again.');
  }
});

// Authorization - restrict to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not authorized to access this resource.`);
    }
    next();
  };
};

// Optional auth - attaches user if token present, does not block if missing
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
