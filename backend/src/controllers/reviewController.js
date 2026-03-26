const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');
const { Review, Order, Restaurant } = require('../models');

const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order || order.userId !== req.user.id) {
    throw new ApiError(404, 'Order not found for current user.');
  }

  if (order.status !== 'delivered') {
    throw new ApiError(409, 'Review can only be submitted for delivered orders.');
  }

  const existing = await Review.findOne({ where: { orderId } });
  if (existing) {
    throw new ApiError(409, 'Review already exists for this order.');
  }

  const review = await Review.create({
    orderId,
    userId: req.user.id,
    restaurantId: order.restaurantId,
    rating,
    comment,
  });

  return sendSuccess(res, review, 'Review created.', 201);
});

const getRestaurantReviews = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }

  const reviews = await Review.findAll({ where: { restaurantId }, order: [['id', 'DESC']] });

  return sendSuccess(res, reviews, 'Reviews fetched.');
});

module.exports = {
  createReview,
  getRestaurantReviews,
};
