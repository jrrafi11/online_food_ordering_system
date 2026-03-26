const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const healthCheck = asyncHandler(async (_req, res) => {
  return sendSuccess(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
    'Service is healthy.'
  );
});

module.exports = {
  healthCheck,
};
