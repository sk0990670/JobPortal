const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    // Application data
    coverLetter: { type: String, default: '' },
    resume: {
      url: { type: String, required: [true, 'Resume is required'] },
      filename: { type: String },
    },

    // Status tracking
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected', 'Withdrawn'],
      default: 'Applied',
    },

    // Timeline
    timeline: [
      {
        status: { type: String },
        message: { type: String },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    // Interview details
    interviewDate: { type: Date },
    interviewMode: {
      type: String,
      enum: ['Online', 'In-person', 'Phone', 'Video'],
    },
    interviewNotes: { type: String },

    // Recruiter notes (hidden from applicant)
    recruiterNotes: { type: String, select: false },

    // Offer details
    offerDetails: {
      salary: { type: Number },
      joiningDate: { type: Date },
      validUntil: { type: Date },
    },

    // Metadata
    appliedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ company: 1 });
applicationSchema.index({ appliedAt: -1 });

// Pre-save: add to timeline on status change
applicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.timeline.push({ status: this.status, updatedAt: new Date() });
    this.lastUpdated = new Date();
  }
  next();
});

// Post-save: update job applicationCount
applicationSchema.post('save', async function (doc) {
  try {
    const Job = require('./Job');
    const count = await mongoose.model('Application').countDocuments({ job: doc.job });
    await Job.findByIdAndUpdate(doc.job, { applicationCount: count });
  } catch (err) {
    console.error('Error updating application count:', err.message);
  }
});

module.exports = mongoose.model('Application', applicationSchema);
