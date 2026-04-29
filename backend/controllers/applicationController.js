const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply to a job
// @route   POST /api/applications/:jobId/apply
// @access  Private (student)
const applyToJob = asyncHandler(async (req, res) => {
  const { coverLetter } = req.body;
  const jobId = req.params.jobId;
  const userId = req.user.id;

  const job = await Job.findById(jobId).populate('company');
  if (!job) { res.status(404); throw new Error('Job not found.'); }
  if (job.status !== 'active') { res.status(400); throw new Error('This job is no longer accepting applications.'); }

  const existing = await Application.findOne({ job: jobId, applicant: userId });
  if (existing) { res.status(409); throw new Error('You have already applied to this job.'); }

  const user = await User.findById(userId);
  if (!user.resume?.url) { res.status(400); throw new Error('Please upload your resume before applying.'); }

  const application = await Application.create({
    job: jobId,
    applicant: userId,
    company: job.company._id,
    coverLetter,
    resume: { url: user.resume.url, filename: user.resume.filename },
    timeline: [{ status: 'Applied', updatedAt: new Date() }],
  });

  await application.populate([
    { path: 'job', select: 'title jobType salary location', populate: { path: 'company', select: 'name logo' } },
  ]);

  res.status(201).json({ success: true, message: 'Application submitted successfully!', data: application });
});

// @desc    Get user's applications
// @route   GET /api/applications/my
// @access  Private (student)
const getMyApplications = asyncHandler(async (req, res) => {
  const { status, search, sort = '-appliedAt', page = 1, limit = 10 } = req.query;

  const filter = { applicant: req.user.id };
  if (status && status !== 'All') filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate({ path: 'job', select: 'title jobType salary location workMode', populate: { path: 'company', select: 'name logo isVerified' } })
      .sort(sort).skip(skip).limit(Number(limit)),
    Application.countDocuments(filter),
  ]);

  // Status counts
  const counts = await Application.aggregate([
    { $match: { applicant: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const statusCounts = { All: total, Applied: 0, Shortlisted: 0, Interview: 0, Offered: 0, Rejected: 0 };
  counts.forEach(c => { statusCounts[c._id] = c.count; });

  res.json({ success: true, count: applications.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), statusCounts, data: applications });
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate({ path: 'job', populate: { path: 'company', select: 'name logo isVerified description website' } })
    .populate({ path: 'applicant', select: 'fullName email phone avatar headline skills resume' });

  if (!application) { res.status(404); throw new Error('Application not found.'); }

  const isApplicant = application.applicant._id.toString() === req.user.id;
  const isRecruiter = req.user.role === 'recruiter' || req.user.role === 'admin';
  if (!isApplicant && !isRecruiter) { res.status(403); throw new Error('Not authorized.'); }

  res.json({ success: true, data: application });
});

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
// @access  Private (recruiter/admin)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, message, interviewDate, interviewMode } = req.body;
  const validStatuses = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];
  if (!validStatuses.includes(status)) { res.status(400); throw new Error('Invalid status.'); }

  const application = await Application.findById(req.params.id);
  if (!application) { res.status(404); throw new Error('Application not found.'); }

  application.status = status;
  if (message) application.timeline[application.timeline.length - 1].message = message;
  if (interviewDate) application.interviewDate = interviewDate;
  if (interviewMode) application.interviewMode = interviewMode;
  application.lastUpdated = new Date();
  await application.save();

  res.json({ success: true, message: `Application status updated to ${status}.`, data: application });
});

// @desc    Withdraw application
// @route   DELETE /api/applications/:id/withdraw
// @access  Private (student)
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) { res.status(404); throw new Error('Application not found.'); }
  if (application.applicant.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized.'); }
  if (['Offered', 'Rejected'].includes(application.status)) {
    res.status(400); throw new Error('Cannot withdraw this application.');
  }
  application.status = 'Withdrawn';
  await application.save();
  res.json({ success: true, message: 'Application withdrawn.' });
});

// @desc    Get applications for a job (recruiter)
// @route   GET /api/applications/job/:jobId
// @access  Private (recruiter/admin)
const getJobApplications = asyncHandler(async (req, res) => {
  const { status, sort = '-appliedAt', page = 1, limit = 20 } = req.query;
  const job = await Job.findById(req.params.jobId);
  if (!job) { res.status(404); throw new Error('Job not found.'); }
  if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized.');
  }

  const filter = { job: req.params.jobId };
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate({ path: 'applicant', select: 'fullName email phone avatar headline skills resume profileCompletion' })
      .sort(sort).skip(skip).limit(Number(limit)),
    Application.countDocuments(filter),
  ]);
  res.json({ success: true, count: applications.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: applications });
});

module.exports = { applyToJob, getMyApplications, getApplicationById, updateApplicationStatus, withdrawApplication, getJobApplications };
