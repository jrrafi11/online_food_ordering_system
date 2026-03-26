const { body } = require('express-validator');

const createOrderValidation = [
  body('restaurantId').isInt({ min: 1 }).withMessage('restaurantId is required.'),
  body('items').isArray({ min: 1 }).withMessage('At least one order item is required.'),
  body('items.*.foodItemId').isInt({ min: 1 }).withMessage('foodItemId is required.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1.'),
  body('deliveryAddress').trim().notEmpty().withMessage('deliveryAddress is required.'),
  body('paymentMethod').optional().isIn(['cod', 'stripe_mock']),
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled'])
    .withMessage('Invalid order status.'),
];

module.exports = {
  createOrderValidation,
  updateStatusValidation,
};
