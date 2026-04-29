const express = require('express');
const { applyToJob, getMyApplications, getApplicationById, updateApplicationStatus, withdrawApplication, getJobApplications } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyApplications);
router.post('/:jobId/apply', authorize('user'), applyToJob);
router.get('/job/:jobId', authorize('recruiter', 'admin'), getJobApplications);
router.get('/:id', getApplicationById);
router.put('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id/withdraw', authorize('user'), withdrawApplication);

module.exports = router;
