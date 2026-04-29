const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');
const { notifySubscribers } = require('./subscriberController');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = asyncHandler(async (req, res) => {
  const { search, category, sort = '-createdAt', page = 1, limit = 12 } = req.query;

  const filter = { isPublished: true };
  if (category && category !== 'All Resources') filter.category = category;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { excerpt: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [resources, total] = await Promise.all([
    Resource.find(filter).sort(sort).skip(skip).limit(Number(limit)).select('-content -__v'),
    Resource.countDocuments(filter),
  ]);

  // Category counts
  const categoryCounts = await Resource.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, count: resources.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), categoryCounts, data: resources });
});

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id).populate('author', 'fullName avatar');
  if (!resource || !resource.isPublished) { res.status(404); throw new Error('Resource not found.'); }
  resource.views += 1;
  await resource.save({ validateBeforeSave: false });
  res.json({ success: true, data: resource });
});

// @desc    Get featured resources
// @route   GET /api/resources/featured
// @access  Public
const getFeaturedResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ isPublished: true, isFeatured: true })
    .sort('-createdAt').limit(4).select('-content -__v');
  res.json({ success: true, count: resources.length, data: resources });
});

// @desc    Create resource (admin)
// @route   POST /api/resources
// @access  Private (admin)
const createResource = asyncHandler(async (req, res) => {
  const resource = await Resource.create({ ...req.body, author: req.user.id });
  // Fire-and-forget: email all subscribers (non-blocking)
  notifySubscribers(resource).catch(e => console.error('Notify error:', e.message));
  res.status(201).json({ success: true, message: 'Resource created.', data: resource });
});

// @desc    Toggle bookmark resource
// @route   POST /api/resources/:id/bookmark
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) { res.status(404); throw new Error('Resource not found.'); }

  const isBookmarked = resource.bookmarks.includes(req.user.id);
  if (isBookmarked) {
    resource.bookmarks = resource.bookmarks.filter(id => id.toString() !== req.user.id);
  } else {
    resource.bookmarks.push(req.user.id);
  }
  await resource.save({ validateBeforeSave: false });

  res.json({ success: true, isBookmarked: !isBookmarked, message: isBookmarked ? 'Bookmark removed.' : 'Resource bookmarked.' });
});

module.exports = { getResources, getResourceById, getFeaturedResources, createResource, toggleBookmark };
