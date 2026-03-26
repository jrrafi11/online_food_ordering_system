const multer = require('multer');
const ApiError = require('../utils/ApiError');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const isMultipartBoundaryError = (message) => {
  if (typeof message !== 'string') {
    return false;
  }

  const normalized = message.toLowerCase();
  return normalized.includes('multipart') && normalized.includes('boundary');
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';

  if (error instanceof multer.MulterError) {
    statusCode = 400;

    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'Image is too large. Maximum size is 5MB.';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected upload field. Please select a valid image field.';
    } else {
      message = error.message || 'Invalid file upload request.';
    }
  } else if (isMultipartBoundaryError(message)) {
    statusCode = 400;
    message = 'Malformed multipart upload request. Please retry selecting the image.';
  }

  const payload = {
    success: false,
    message,
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV === 'development' && error.stack) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = {
  notFound,
  errorHandler,
};
