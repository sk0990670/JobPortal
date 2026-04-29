/**
 * uploadMiddleware.js
 * Replaces local disk storage with Cloudinary.
 * All three upload instances (resume, logo, avatar) stream files
 * directly to Cloudinary — no local /uploads folder needed.
 */
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

/* ─── Cloudinary storage buckets ─── */

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:        'jobportal/resumes',
    resource_type: 'raw',                        // PDFs must be raw
    public_id:     `resume-${req.user?.id || 'user'}-${Date.now()}`,
    allowed_formats: ['pdf', 'doc', 'docx'],
  }),
});

const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          'jobportal/logos',
    resource_type:   'image',
    public_id:       `logo-${Date.now()}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    transformation:  [{ width: 400, height: 400, crop: 'limit' }],
  }),
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          'jobportal/avatars',
    resource_type:   'image',
    public_id:       `avatar-${req.user?.id || 'user'}-${Date.now()}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
  }),
});

/* ─── Multer upload instances ─── */

const uploadResume = multer({
  storage: resumeStorage,
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadLogo = multer({
  storage: logoStorage,
  limits:  { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits:  { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

/* ─── Multer error handler ─── */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = { uploadResume, uploadLogo, uploadAvatar, handleMulterError };
