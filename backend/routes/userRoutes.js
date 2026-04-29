const express = require('express');
const { getProfile, updateProfile, uploadResume, uploadAvatar, toggleSaveJob, getSavedJobs, updateSettings, getDashboard, deactivateAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume: uploadResumeMiddleware, uploadAvatar: uploadAvatarMiddleware, handleMulterError } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-resume', uploadResumeMiddleware.single('resume'), handleMulterError, uploadResume);
router.post('/upload-avatar', uploadAvatarMiddleware.single('avatar'), handleMulterError, uploadAvatar);
router.post('/save-job/:jobId', toggleSaveJob);
router.get('/saved-jobs', getSavedJobs);
router.put('/settings', updateSettings);
router.get('/dashboard', getDashboard);
router.delete('/deactivate', deactivateAccount);

module.exports = router;
