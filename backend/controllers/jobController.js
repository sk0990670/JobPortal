const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Company = require('../models/Company');

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (recruiter/admin)
const createJob = asyncHandler(async (req, res) => {
  const { title, companyId, companyName, companyWebsite, companyLocation, companyLogo,
    description, jobType, workMode, jobFunction, experienceLevel, batch,
    salary, duration, applyLink,
    contactEmail, extraEmail, contactPhone,
    city, state, country } = req.body;

  const finalLocation = companyLocation || [city, state, country].filter(Boolean).join(', ');

  let company;
  if (!applyLink && !contactEmail && !extraEmail && !contactPhone) {
    res.status(400);
    throw new Error('Please provide an application link or at least one contact method (email or phone).');
  }

  if (companyId) {
    company = await Company.findById(companyId);
    if (!company) { res.status(404); throw new Error('Company not found.'); }
  } else {
    company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
    if (!company) {
      company = await Company.create({ name: companyName, website: companyWebsite, addedBy: req.user.id });
    }
  }

  // ── Sync logo, website, location & increment openings onto the Company document ──────────────────
  const companyUpdates = { $inc: { openings: 1 } };
  if (companyLogo)    companyUpdates.logo    = companyLogo;
  if (companyWebsite) companyUpdates.website = companyWebsite;
  if (finalLocation && !company.headquarters?.city) companyUpdates['headquarters.city'] = finalLocation;
  await Company.findByIdAndUpdate(company._id, companyUpdates);

  const job = await Job.create({
    title, company: company._id, postedBy: req.user.id, description,
    jobType, workMode, jobFunction, experienceLevel, batch,
    salary: { min: salary?.min, max: salary?.max, currency: salary?.currency || 'INR', period: salary?.period || 'month' },
    duration, applyLink,
    // Denormalized fields for quick display without DB joins
    companyName, companyWebsite, companyLocation: finalLocation, companyLogo,
    contactEmail, extraEmail, contactPhone,
  });

  await job.populate({ path: 'company', select: 'name logo isVerified' });

  // -- Real-time Notification Matching Logic --
  try {
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const { getIO } = require('../socket');
    const { sendJobAlertEmail } = require('../utils/emailService');

    const query = {
      $and: [
        { 'preferences.jobTypes': { $in: [jobType] } },
        {
          $or: [
            { 'preferences.locations': { $size: 0 } },
            { 'preferences.locations': { $in: [finalLocation].filter(Boolean) } }
          ]
        }
      ]
    };

    const matchedUsers = await User.find(query).select('_id email fullName settings');

    if (matchedUsers.length > 0) {
      const io = getIO();
      const notifications = matchedUsers.map(user => ({
        user: user._id,
        message: `New matching job posted: ${title} at ${companyName}`,
        type: 'job_alert',
        relatedJob: job._id
      }));

      const createdNotifications = await Notification.insertMany(notifications);

      // Emit to each matched user's personal room & queue email if enabled
      for (let i = 0; i < createdNotifications.length; i++) {
        const notification = createdNotifications[i];
        const user = matchedUsers[i];
        io.to(notification.user.toString()).emit('new_notification', notification);

        if (user.settings?.emailNotifications?.jobAlerts) {
          user.pendingJobAlerts.push(job._id);
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error('Error emitting notifications for new job:', error);
  }

  res.status(201).json({ success: true, message: 'Job posted successfully.', data: job });
});

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const { search, jobType, workMode, location, skills, minSalary, maxSalary,
    batch, status = 'active', sort = '-createdAt', page = 1, limit = 10 } = req.query;

  const filter = {};
  if (status !== 'all') filter.status = status;
  if (jobType) filter.jobType = { $in: jobType.split(',') };
  if (workMode) filter.workMode = { $in: workMode.split(',') };
  if (location) filter.companyLocation = { $regex: location, $options: 'i' };
  if (batch) filter.batch = { $regex: batch, $options: 'i' };
  if (minSalary) filter['salary.min'] = { $gte: Number(minSalary) };
  if (maxSalary) filter['salary.max'] = { $lte: Number(maxSalary) };
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { companyName: { $regex: search, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find(filter).populate({ path: 'company', select: 'name logo isVerified industry' })
      .sort(sort).skip(skip).limit(Number(limit)).select('-__v'),
    Job.countDocuments(filter),
  ]);

  res.json({ success: true, count: jobs.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: jobs });
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate({ path: 'company', select: 'name logo isVerified website description industry size headquarters' })
    .populate({ path: 'postedBy', select: 'fullName avatar' });

  if (!job) { res.status(404); throw new Error('Job not found.'); }
  await job.incrementViews();

  const similarJobs = await Job.find({
    _id: { $ne: job._id }, status: 'active',
    $or: [{ jobFunction: job.jobFunction }, { companyLocation: job.companyLocation }],
  }).populate({ path: 'company', select: 'name logo' }).limit(4).select('title company companyLocation salary jobType workMode');

  res.json({ success: true, data: job, similarJobs });
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found.'); }
  if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized.');
  }

  const { applyLink, contactEmail, extraEmail, contactPhone } = req.body;
  if (!applyLink && !contactEmail && !extraEmail && !contactPhone) {
    res.status(400);
    throw new Error('Please provide an application link or at least one contact method (email or phone).');
  }

  // Sync logo & website back onto the Company document
  const { companyLogo, companyWebsite } = req.body;
  const companyUpdates = {};
  if (companyLogo)    companyUpdates.logo    = companyLogo;
  if (companyWebsite) companyUpdates.website = companyWebsite;
  if (Object.keys(companyUpdates).length) {
    await Company.findByIdAndUpdate(job.company, companyUpdates);
  }

  const oldStatus = job.status;
  job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate({ path: 'company', select: 'name logo isVerified' });
  
  if (oldStatus !== job.status) {
    if (job.status === 'active') {
      await Company.findByIdAndUpdate(job.company._id || job.company, { $inc: { openings: 1 } });
    } else if (oldStatus === 'active' && job.status !== 'active') {
      await Company.findByIdAndUpdate(job.company._id || job.company, { $inc: { openings: -1 } });
    }
  }

  res.json({ success: true, message: 'Job updated.', data: job });
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found.'); }
  if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized.');
  }
  await Company.findByIdAndUpdate(job.company, { $inc: { openings: -1 } });
  await job.deleteOne();
  res.json({ success: true, message: 'Job deleted.' });
});

// @desc    Upload company logo
// @route   POST /api/jobs/upload-logo
// @access  Private
const uploadCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('Please upload an image.'); }
  // multer-storage-cloudinary puts the full Cloudinary URL in req.file.path
  res.json({ success: true, data: { url: req.file.path } });
});

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
const getFeaturedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ status: 'active', isFeatured: true })
    .populate({ path: 'company', select: 'name logo isVerified' })
    .sort('-createdAt').limit(8).select('title company companyLocation jobType workMode salary createdAt');
  res.json({ success: true, count: jobs.length, data: jobs });
});

// @desc    Get internships
// @route   GET /api/jobs/internships
// @access  Public
const getInternships = asyncHandler(async (req, res) => {
  const { search, location, duration, minSalary, maxSalary, ppoAvailable, sort = '-createdAt', page = 1, limit = 10 } = req.query;
  const filter = { status: 'active', jobType: 'Internship' };
  if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { companyName: { $regex: search, $options: 'i' } }];
  if (location) filter.companyLocation = { $regex: location, $options: 'i' };
  if (duration) filter.duration = { $regex: duration, $options: 'i' };
  
  if (minSalary !== undefined) {
    filter['salary.min'] = { $gte: Number(minSalary) };
  }
  
  // Handle Unpaid which implies maxSalary = 0 or missing
  let maxSalaryCondition = null;
  if (maxSalary !== undefined) {
    maxSalaryCondition = {
      $or: [
        { 'salary.max': { $lte: Number(maxSalary) } },
        { 'salary.min': null },
        { 'salary.min': 0 },
        { 'salary.max': null },
        { 'salary.max': 0 }
      ]
    };
  }

  // Merge $or conditions safely
  if (filter.$or && maxSalaryCondition) {
    filter.$and = [{ $or: filter.$or }, maxSalaryCondition];
    delete filter.$or;
  } else if (maxSalaryCondition) {
    filter.$or = maxSalaryCondition.$or;
  }
  
  if (ppoAvailable === 'true') filter.ppoAvailable = true;
  
  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find(filter).populate({ path: 'company', select: 'name logo isVerified' })
      .sort(sort).skip(skip).limit(Number(limit)),
    Job.countDocuments(filter),
  ]);
  res.json({ success: true, count: jobs.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: jobs });
});

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, uploadCompanyLogo, getFeaturedJobs, getInternships };
