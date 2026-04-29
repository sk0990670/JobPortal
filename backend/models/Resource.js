const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: { type: String, unique: true },
    excerpt: { type: String, maxlength: 500 },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['Career Guidance', 'Resume & Cover Letter', 'Interview Tips', 'Skills & Development', 'Industry Insights'],
      required: true,
    },
    tags: [{ type: String }],
    thumbnail: { type: String, default: '' },
    readTime: { type: Number, default: 5 }, // minutes
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Auto-generate slug
resourceSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);
  }
  next();
});

resourceSchema.index({ title: 'text', content: 'text', tags: 'text' });
resourceSchema.index({ category: 1 });
resourceSchema.index({ isFeatured: 1 });
resourceSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
