const { body } = require('express-validator');

const createRestaurantValidation = [
  body('name').trim().notEmpty().withMessage('Restaurant name is required.'),
  body('address').trim().notEmpty().withMessage('Restaurant address is required.'),
  body('cuisineType').optional().isLength({ max: 80 }),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('latitude must be between -90 and 90.'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('longitude must be between -180 and 180.'),
  body('deliveryEtaMinutes')
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage('deliveryEtaMinutes must be between 5 and 180.'),
  body('deliveryFee')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('deliveryFee must be between 0 and 1000.'),
  body('minOrder')
    .optional()
    .isFloat({ min: 0, max: 5000 })
    .withMessage('minOrder must be between 0 and 5000.'),
  body('featured').optional().isBoolean(),
  body('description').optional().isLength({ max: 2000 }),
];

const createMenuItemValidation = [
  body('name').trim().notEmpty().withMessage('Food item name is required.'),
  body('price').isFloat({ min: 0.1 }).withMessage('Price must be greater than zero.'),
  body('description').optional().isLength({ max: 2000 }),
];

const updateRestaurantValidation = [
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty.'),
  body('address').optional().trim().notEmpty().withMessage('address cannot be empty.'),
  body('cuisineType').optional().isLength({ max: 80 }),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('latitude must be between -90 and 90.'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('longitude must be between -180 and 180.'),
  body('deliveryEtaMinutes')
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage('deliveryEtaMinutes must be between 5 and 180.'),
  body('deliveryFee')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('deliveryFee must be between 0 and 1000.'),
  body('minOrder')
    .optional()
    .isFloat({ min: 0, max: 5000 })
    .withMessage('minOrder must be between 0 and 5000.'),
  body('featured').optional().isBoolean(),
];

module.exports = {
  createRestaurantValidation,
  createMenuItemValidation,
  updateRestaurantValidation,
};
