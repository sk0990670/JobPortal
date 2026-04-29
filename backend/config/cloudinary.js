const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with env credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ─────────────────────────────────────────
   Storage presets
───────────────────────────────────────── */

// Company logos / avatars (images only, max 2 MB)
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'jobportal/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }],
  },
});

// User profile avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'jobportal/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
  },
});

// Resumes / PDFs (raw files)
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'jobportal/resumes',
    resource_type:   'raw',          // PDFs are not images
    allowed_formats: ['pdf', 'doc', 'docx'],
  },
});

/* ─────────────────────────────────────────
   Multer upload instances
───────────────────────────────────────── */
const uploadLogo   = multer({ storage: logoStorage,   limits: { fileSize: 2 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadResume = multer({ storage: resumeStorage, limits: { fileSize: 5 * 1024 * 1024 } });

/* ─────────────────────────────────────────
   Helper — delete a file from Cloudinary
───────────────────────────────────────── */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = {
  cloudinary,
  uploadLogo,
  uploadAvatar,
  uploadResume,
  deleteFromCloudinary,
};
