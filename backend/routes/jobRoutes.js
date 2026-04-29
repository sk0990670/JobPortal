const express = require('express');
const { createJob, getJobs, getJobById, updateJob, deleteJob, uploadCompanyLogo, getFeaturedJobs, getInternships } = require('../controllers/jobController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const { uploadLogo, handleMulterError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// ── Public routes ──────────────────────────────────
router.get('/featured',    getFeaturedJobs);
router.get('/internships', getInternships);
router.get('/',            optionalAuth, getJobs);
router.get('/:id',         optionalAuth, getJobById);

// ── Admin-only routes ──────────────────────────────
router.use(protect);
router.post(  '/',            authorize('admin'), createJob);
router.put(   '/:id',         authorize('admin'), updateJob);
router.delete('/:id',         authorize('admin'), deleteJob);
router.post(  '/upload-logo', authorize('admin'), uploadLogo.single('logo'), handleMulterError, uploadCompanyLogo);

module.exports = router;
