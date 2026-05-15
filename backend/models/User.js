const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number },
  grade: { type: String },
  current: { type: Boolean, default: false },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  technologies: [String],
  link: { type: String },
  github: { type: String },
});

const certificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date },
  credentialId: { type: String },
  credentialUrl: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
      // Not required — OAuth users (Google) have no local password
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    googleId:   { type: String, default: '' }, // Google OAuth ID
    linkedinId: { type: String, default: '' }, // LinkedIn OAuth ID
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    location: { type: String, default: '' },
    headline: { type: String, default: '', maxlength: 200 },
    summary: { type: String, default: '', maxlength: 2000 },

    // Professional
    experienceLevel: {
      type: String,
      enum: ['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'],
      default: 'Fresher',
    },
    currentStatus: {
      type: String,
      enum: ['Actively looking', 'Open to opportunities', 'Not looking'],
      default: 'Actively looking',
    },
    noticePeriod: {
      type: String,
      enum: ['Immediate', '15 days', '1 month', '2 months', '3 months'],
      default: 'Immediate',
    },

    // Skills
    skills: [{ type: String, trim: true }],

    // Sub-documents
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    certificates: [certificateSchema],

    // Resume
    resume: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
      updatedAt: { type: Date },
    },

    // Social profiles
    profiles: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },

    // Preferences
    preferences: {
      preferredRole: { type: String, default: '' },
      workMode: { type: String, default: '' },
      jobType: { type: String, default: '' },
      preferredLocation: { type: String, default: '' },
      expectedSalary: { type: String, default: '' },
      desiredSkills: { type: String, default: '' }
    },

    // Settings
    settings: {
      emailNotifications: {
        jobAlerts: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false },
        weeklySummary: { type: Boolean, default: true },
      },
      profileVisibility: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      twoFactorEnabled: { type: Boolean, default: false },
      twoFactorSecret: { type: String, default: null },
    },

    // Pending job alerts
    pendingJobAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // Saved jobs
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // Profile completion
    profileCompletion: { type: Number, default: 25 },

    // Auth
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
    passwordResetToken:   { type: String },
    passwordResetExpires: { type: Date },

    // Email OTP verification
    otp:        { type: String, select: false },
    otpExpires: { type: Date,   select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: applications
userSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'applicant',
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Calculate profile completion before save
userSchema.pre('save', function (next) {
  let completion = 25; // base
  if (this.phone) completion += 5;
  if (this.location) completion += 5;
  if (this.headline) completion += 5;
  if (this.summary) completion += 10;
  if (this.skills.length > 0) completion += 10;
  if (this.education.length > 0) completion += 10;
  if (this.experience.length > 0) completion += 10;
  if (this.projects.length > 0) completion += 5;
  if (this.resume.url) completion += 10;
  if (this.profiles.linkedin || this.profiles.github) completion += 5;
  this.profileCompletion = Math.min(completion, 100);
  next();
});

// Compare password (safe for OAuth users with no password)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // OAuth-only account
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password changed after JWT issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Indexes (email already indexed via unique:true)
userSchema.index({ skills: 1 });
userSchema.index({ location: 1 });

module.exports = mongoose.model('User', userSchema);
