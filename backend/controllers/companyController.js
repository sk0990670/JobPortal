const asyncHandler = require('express-async-handler');
const Company = require('../models/Company');
const Job = require('../models/Job');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getCompanies = asyncHandler(async (req, res) => {
  const { search, location, size, industry, sort = '-openings', page = 1, limit = 12 } = req.query;

  const filter = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { industry: { $regex: search, $options: 'i' } }];
  if (location) filter['headquarters.city'] = { $regex: location, $options: 'i' };
  if (size) filter.size = { $in: size.split(',') };
  if (industry) filter.industry = { $in: industry.split(',') };

  const skip = (Number(page) - 1) * Number(limit);
  const [companies, total] = await Promise.all([
    Company.find(filter).sort(sort).skip(skip).limit(Number(limit)).select('-__v'),
    Company.countDocuments(filter),
  ]);

  res.json({ success: true, count: companies.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: companies });
});

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) { res.status(404); throw new Error('Company not found.'); }

  const jobs = await Job.find({ company: company._id, status: 'active' })
    .sort('-createdAt').limit(10).select('title jobType workMode salary location createdAt');

  res.json({ success: true, data: company, jobs });
});

// @desc    Create company
// @route   POST /api/companies
// @access  Private (recruiter/admin)
const createCompany = asyncHandler(async (req, res) => {
  const existing = await Company.findOne({ name: req.body.name });
  if (existing) { res.status(409); throw new Error('Company already exists.'); }

  const company = await Company.create({ ...req.body, addedBy: req.user.id });
  res.status(201).json({ success: true, message: 'Company created.', data: company });
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (admin)
const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) { res.status(404); throw new Error('Company not found.'); }
  res.json({ success: true, message: 'Company updated.', data: company });
});

// @desc    Get featured companies
// @route   GET /api/companies/featured
// @access  Public
const getFeaturedCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ isFeatured: true }).sort('-openings').limit(6).select('name logo industry isVerified openings headquarters');
  res.json({ success: true, count: companies.length, data: companies });
});

module.exports = { getCompanies, getCompanyById, createCompany, updateCompany, getFeaturedCompanies };
