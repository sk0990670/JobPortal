const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
    industry: {
      type: String,
      enum: [
        'Software Development', 'Internet Services', 'Aerospace & Defense',
        'Data & Analytics', 'Product Development', 'E-commerce',
        'IT Services', 'Finance', 'Healthcare', 'Education',
        'Manufacturing', 'Consulting', 'Other',
      ],
      default: 'Software Development',
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'],
      default: '51-200',
    },
    founded: { type: Number },
    headquarters: {
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'India' },
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      glassdoor: { type: String, default: '' },
    },
    benefits: [{ type: String }],
    culture: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    openings: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: job count
companySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'company',
  count: true,
});

companySchema.index({ name: 'text', description: 'text', industry: 'text' });
companySchema.index({ isVerified: 1 });
companySchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Company', companySchema);
