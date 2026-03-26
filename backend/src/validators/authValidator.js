const { body } = require('express-validator');

const registerValidation = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required.'),
  body('email').isEmail().withMessage('A valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('role')
    .optional()
    .isIn(['user', 'restaurant', 'rider', 'admin'])
    .withMessage('Invalid role.'),
];

const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const registerCustomerValidation = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required.'),
  body('email').isEmail().withMessage('A valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('phone').optional().isLength({ max: 30 }),
];

module.exports = {
  registerValidation,
  registerCustomerValidation,
  loginValidation,
};
