const express = require('express');
const { getResources, getResourceById, getFeaturedResources, createResource, toggleBookmark } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/featured', getFeaturedResources);
router.get('/', getResources);
router.get('/:id', getResourceById);

router.use(protect);
router.post('/', authorize('admin'), createResource);
router.post('/:id/bookmark', toggleBookmark);

module.exports = router;
