const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token is missing.');
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error?.name === 'TokenExpiredError' ||
      error?.name === 'JsonWebTokenError' ||
      error?.name === 'NotBeforeError'
    ) {
      next(new ApiError(401, 'Invalid or expired authentication token.'));
      return;
    }

    next(error);
  }
};

module.exports = auth;
