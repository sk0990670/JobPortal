const express = require('express');
const { subscribe, unsubscribe, listSubscribers } = require('../controllers/subscriberController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/subscribe',   subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/',  protect, authorize('admin'), listSubscribers);

module.exports = router;
