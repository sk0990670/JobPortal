const express = require('express');
const { getCompanies, getCompanyById, createCompany, updateCompany, getFeaturedCompanies } = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/featured', getFeaturedCompanies);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

router.use(protect);
router.post('/', authorize('recruiter', 'admin'), createCompany);
router.put('/:id', authorize('admin'), updateCompany);

module.exports = router;
