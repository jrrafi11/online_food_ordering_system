const { body } = require('express-validator');

const createReviewValidation = [
  body('orderId').isInt({ min: 1 }).withMessage('orderId is required.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5.'),
  body('comment').optional().isLength({ max: 2000 }),
];

module.exports = {
  createReviewValidation,
};
