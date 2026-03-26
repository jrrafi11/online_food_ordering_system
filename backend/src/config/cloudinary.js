const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const normalizeEnvValue = (value) => (typeof value === 'string' ? value.trim() : '');

const isPlaceholderConfigValue = (value) => {
  const normalized = normalizeEnvValue(value).toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    normalized.startsWith('your_') ||
    normalized.includes('example') ||
    normalized.includes('change_me') ||
    normalized === 'null' ||
    normalized === 'none'
  );
};

const cloudinaryCloudName = normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME);
const cloudinaryApiKey = normalizeEnvValue(process.env.CLOUDINARY_API_KEY);
const cloudinaryApiSecret = normalizeEnvValue(process.env.CLOUDINARY_API_SECRET);

const hasCloudinaryConfig = [cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret].every(
  (value) => !isPlaceholderConfigValue(value)
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });
}

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!hasCloudinaryConfig) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    let folder = 'food-ordering/misc';
    if (file.fieldname === 'profileImage') folder = 'food-ordering/profiles';
    if (file.fieldname === 'foodImage') folder = 'food-ordering/food';
    if (file.fieldname === 'restaurantImage') folder = 'food-ordering/restaurants';

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    };
  },
});

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const originalExt = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(originalExt)
      ? originalExt
      : '.jpg';

    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage: hasCloudinaryConfig ? cloudinaryStorage : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'), false);
  },
});

const getUploadedFileUrl = (req, file) => {
  if (!file) {
    return null;
  }

  if (hasCloudinaryConfig) {
    return file.path || file.secure_url || null;
  }

  const filename = file.filename || path.basename(file.path || '');
  if (!filename) {
    return null;
  }

  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

module.exports = { cloudinary, upload, hasCloudinaryConfig, uploadsDir, getUploadedFileUrl };
