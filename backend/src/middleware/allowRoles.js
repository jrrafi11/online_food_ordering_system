const ApiError = require('../utils/ApiError');

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Unauthorized.'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden.'));
  }

  return next();
};

module.exports = allowRoles;
