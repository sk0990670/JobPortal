const express = require('express');
const { getDashboardStats, getAllUsers, getSystemStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/system-status', getSystemStatus);

module.exports = router;

