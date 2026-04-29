const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Job details
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    eligibilityCriteria: [{ type: String }],
    technicalSkills: [{ type: String }],
    softSkills: [{ type: String }],
    perks: [{ type: String }],

    // Classification
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
      required: true,
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      required: true,
    },
    jobFunction: {
      type: String,
      enum: [
        'Software Engineering', 'Data Science', 'Product Management', 'Design',
        'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Analytics',
        'Machine Learning', 'DevOps', 'Cybersecurity', 'Other'
      ],
      default: 'Software Engineering',
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Any'],
      default: 'Fresher',
    },
    batch: {
      type: String,
      default: '2025/2026',
    },

    // Location
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'India' },
      fullAddress: { type: String },
    },

    // Compensation
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['month', 'year', 'week', 'day'], default: 'month' },
      isNegotiable: { type: Boolean, default: false },
    },

    // Duration (for internships)
    duration: { type: String },

    // Apply info
    applicationDeadline: { type: Date },
    applyLink: { type: String },
    applyViaPortal: { type: Boolean, default: true },

    // Skills required
    skills: [{ type: String, trim: true }],

    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'expired'],
      default: 'active',
    },
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    // Stats
    views: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },

    // Direct company info (when not using a Company document)
    companyName:     { type: String },
    companyWebsite:  { type: String },
    companyLocation: { type: String },
    companyLogo:     { type: String }, // Cloudinary URL

    // Contact info
    contactEmail: { type: String },
    contactPhone: { type: String },

    // Tags for search
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full location string
jobSchema.virtual('locationString').get(function () {
  const parts = [this.location?.city, this.location?.state].filter(Boolean);
  return parts.join(', ');
});

// Virtual: salary display
jobSchema.virtual('salaryDisplay').get(function () {
  if (!this.salary?.min) return 'Not disclosed';
  const fmt = (n) => `₹${(n / 1000).toFixed(0)}K`;
  if (this.salary.max && this.salary.max !== this.salary.min) {
    return `${fmt(this.salary.min)} - ${fmt(this.salary.max)}/${this.salary.period}`;
  }
  return `${fmt(this.salary.min)}/${this.salary.period}`;
});

// Indexes for efficient querying
jobSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });
jobSchema.index({ status: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ 'salary.min': 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ isFeatured: 1 });
jobSchema.index({ createdAt: -1 });

// Middleware: increment view count
jobSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Job', jobSchema);
