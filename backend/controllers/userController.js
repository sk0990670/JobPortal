const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Application = require('../models/Application');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'savedJobs',
    populate: { path: 'company', select: 'name logo isVerified' },
    select: 'title jobType workMode salary location createdAt',
  });

  res.json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'fullName', 'phone', 'dateOfBirth', 'location', 'headline', 'summary',
    'experienceLevel', 'currentStatus', 'noticePeriod', 'skills',
    'education', 'experience', 'projects', 'certificates',
    'profiles', 'preferences', 'settings',
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.json({ success: true, message: 'Profile updated successfully.', data: user });
});

// @desc    Upload resume
// @route   POST /api/users/upload-resume
// @access  Private
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a resume file.');
  }

  const user = await User.findById(req.user.id);

  // Delete old resume from Cloudinary if it exists
  if (user.resume?.publicId) {
    await deleteFromCloudinary(user.resume.publicId, 'raw');
  }

  // multer-storage-cloudinary puts the Cloudinary URL in req.file.path
  const resumeUrl   = req.file.path;
  const publicId    = req.file.filename; // Cloudinary public_id

  user.resume = {
    url:      resumeUrl,
    publicId: publicId,
    filename: req.file.originalname,
    updatedAt: new Date(),
  };
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Resume uploaded successfully.',
    data: { url: resumeUrl, filename: req.file.originalname },
  });
});

// @desc    Upload avatar
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file.');
  }

  // Cloudinary URL is in req.file.path
  const avatarUrl = req.file.path;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarUrl },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Avatar uploaded successfully.',
    data: { url: avatarUrl },
  });
});

// @desc    Save / unsave a job
// @route   POST /api/users/save-job/:jobId
// @access  Private
const toggleSaveJob = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const jobId = req.params.jobId;

  const isSaved = user.savedJobs.includes(jobId);
  if (isSaved) {
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
  } else {
    user.savedJobs.push(jobId);
  }
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: isSaved ? 'Job removed from saved list.' : 'Job saved successfully.',
    isSaved: !isSaved,
  });
});

// @desc    Get saved jobs
// @route   GET /api/users/saved-jobs
// @access  Private
const getSavedJobs = asyncHandler(async (req, res) => {
  const { search, sort = '-createdAt', page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user.id).populate({
    path: 'savedJobs',
    populate: { path: 'company', select: 'name logo isVerified' },
    options: { skip: Number(skip), limit: Number(limit), sort },
  });

  let savedJobs = user.savedJobs || [];

  if (search) {
    savedJobs = savedJobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({
    success: true,
    count: savedJobs.length,
    data: savedJobs,
  });
});

// @desc    Update notification settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { settings } },
    { new: true }
  );

  res.json({ success: true, message: 'Settings updated successfully.', data: user.settings });
});

// @desc    Get dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get application stats
  const [applications, savedCount, user] = await Promise.all([
    Application.find({ applicant: userId })
      .populate({ path: 'job', select: 'title salary jobType workMode location', populate: { path: 'company', select: 'name logo isVerified' } })
      .sort('-createdAt')
      .limit(5),
    User.findById(userId).select('savedJobs profileCompletion skills'),
    User.findById(userId).select('fullName skills profileCompletion'),
  ]);

  const stats = await Application.aggregate([
    { $match: { applicant: user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const statMap = { Applied: 0, Shortlisted: 0, Interview: 0, Rejected: 0 };
  stats.forEach((s) => { statMap[s._id] = s.count; });

  res.json({
    success: true,
    data: {
      stats: {
        totalApplications: Object.values(statMap).reduce((a, b) => a + b, 0),
        shortlisted: statMap.Shortlisted,
        interviews: statMap.Interview,
        savedJobs: savedCount?.savedJobs?.length || 0,
      },
      recentApplications: applications,
      profileCompletion: user.profileCompletion,
    },
  });
});

// @desc    Deactivate account
// @route   DELETE /api/users/deactivate
// @access  Private
const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });
  res.json({ success: true, message: 'Account deactivated successfully.' });
});

// @desc    Subscribe to job alerts
// @route   POST /api/users/job-alerts/subscribe
// @access  Private
const subscribeJobAlerts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Check if already subscribed
  if (user.settings?.emailNotifications?.jobAlerts) {
    return res.json({ success: true, message: 'You are already subscribed to job alerts.' });
  }

  // Update settings
  user.settings.emailNotifications.jobAlerts = true;
  await user.save();

  // Send subscription welcome email
  const { sendSubscriptionEmail } = require('../utils/emailService');
  try {
    await sendSubscriptionEmail(user.email, user.fullName);
  } catch (err) {
    console.error('Failed to send subscription email:', err);
  }

  res.json({ success: true, message: 'Successfully subscribed to job alerts! Check your email.', user });
});

module.exports = {
  getProfile, updateProfile, uploadResume, uploadAvatar,
  toggleSaveJob, getSavedJobs, updateSettings, getDashboard, deactivateAccount,
  subscribeJobAlerts,
};
