const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { User, Restaurant, Rider, Order } = require('../models');

const getDashboardMetrics = asyncHandler(async (_req, res) => {
  const [users, restaurants, riders, orders] = await Promise.all([
    User.count(),
    Restaurant.count(),
    Rider.count(),
    Order.count(),
  ]);

  return sendSuccess(res, { users, restaurants, riders, orders }, 'Dashboard metrics fetched.');
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['id', 'DESC']] });
  return sendSuccess(res, users, 'Users fetched.');
});

const listPendingRestaurants = asyncHandler(async (_req, res) => {
  const restaurants = await Restaurant.findAll({ where: { approvalStatus: 'pending' }, order: [['id', 'DESC']] });
  return sendSuccess(res, restaurants, 'Pending restaurants fetched.');
});

const approveRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { status } = req.body;

  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    return sendSuccess(res, null, 'Restaurant not found.', 404);
  }

  await restaurant.update({ approvalStatus: status || 'approved' });

  return sendSuccess(res, restaurant, 'Restaurant approval updated.');
});

const listPendingRiders = asyncHandler(async (_req, res) => {
  const riders = await Rider.findAll({ where: { approvalStatus: 'pending' }, order: [['id', 'DESC']] });
  return sendSuccess(res, riders, 'Pending riders fetched.');
});

const approveRider = asyncHandler(async (req, res) => {
  const { riderId } = req.params;
  const { status } = req.body;

  const rider = await Rider.findByPk(riderId);
  if (!rider) {
    return sendSuccess(res, null, 'Rider not found.', 404);
  }

  await rider.update({ approvalStatus: status || 'approved' });

  return sendSuccess(res, rider, 'Rider approval updated.');
});

module.exports = {
  getDashboardMetrics,
  listUsers,
  listPendingRestaurants,
  approveRestaurant,
  listPendingRiders,
  approveRider,
};
