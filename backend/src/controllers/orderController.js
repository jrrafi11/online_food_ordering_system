const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');
const { ORDER_STATUSES } = require('../utils/constants');
const { emitOrderUpdate } = require('../services/socketService');
const {
  sequelize,
  Restaurant,
  FoodItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  Rider,
  User,
} = require('../models');

const allowedTransitions = {
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.CONFIRMED]: [ORDER_STATUSES.PREPARING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PREPARING]: [ORDER_STATUSES.PICKED_UP, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PICKED_UP]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.DELIVERED]: [],
  [ORDER_STATUSES.CANCELLED]: [],
};

const statusUpdaters = {
  [ORDER_STATUSES.CONFIRMED]: ['restaurant', 'admin'],
  [ORDER_STATUSES.PREPARING]: ['restaurant', 'admin'],
  [ORDER_STATUSES.PICKED_UP]: ['rider', 'admin'],
  [ORDER_STATUSES.DELIVERED]: ['rider', 'admin'],
  [ORDER_STATUSES.CANCELLED]: ['user', 'restaurant', 'admin'],
};

const loadOrderById = async (orderId) => {
  return Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items', include: [{ model: FoodItem, as: 'foodItem' }] },
      { model: Restaurant, as: 'restaurant' },
      { model: Rider, as: 'rider', include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'phone'] }] },
      { model: User, as: 'customer', attributes: ['id', 'fullName', 'phone'] },
      { model: OrderStatusHistory, as: 'statusHistory' },
    ],
    order: [[{ model: OrderStatusHistory, as: 'statusHistory' }, 'id', 'ASC']],
  });
};

const createOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, deliveryAddress, paymentMethod, notes } = req.body;

  const restaurant = await Restaurant.findOne({
    where: {
      id: restaurantId,
      approvalStatus: 'approved',
      isOpen: true,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found or unavailable.');
  }

  const menuItems = await FoodItem.findAll({
    where: {
      id: items.map((item) => item.foodItemId),
      restaurantId,
      isAvailable: true,
    },
  });

  if (menuItems.length !== items.length) {
    throw new ApiError(400, 'One or more menu items are invalid or unavailable.');
  }

  const menuById = menuItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const deliveryFee = Number(restaurant.deliveryFee ?? 2.5);
  const subtotal = items.reduce((sum, item) => {
    const menuItem = menuById[item.foodItemId];
    return sum + Number(menuItem.price) * Number(item.quantity);
  }, 0);

  if (subtotal < Number(restaurant.minOrder || 0)) {
    throw new ApiError(
      400,
      `Minimum order for this restaurant is BDT ${Number(restaurant.minOrder).toFixed(2)}.`
    );
  }

  const total = subtotal + deliveryFee;

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.create(
      {
        userId: req.user.id,
        restaurantId,
        status: ORDER_STATUSES.PENDING,
        subtotal,
        deliveryFee,
        total,
        deliveryAddress,
        paymentMethod: paymentMethod || 'cod',
        notes,
      },
      { transaction }
    );

    const orderItemsPayload = items.map((item) => {
      const menuItem = menuById[item.foodItemId];
      const unitPrice = Number(menuItem.price);
      const quantity = Number(item.quantity);

      return {
        orderId: order.id,
        foodItemId: menuItem.id,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      };
    });

    await OrderItem.bulkCreate(orderItemsPayload, { transaction });

    await OrderStatusHistory.create(
      {
        orderId: order.id,
        status: ORDER_STATUSES.PENDING,
        changedBy: req.user.id,
        note: 'Order placed by user.',
      },
      { transaction }
    );

    await transaction.commit();

    const fullOrder = await loadOrderById(order.id);
    emitOrderUpdate(fullOrder);

    return sendSuccess(res, fullOrder, 'Order placed successfully.', 201);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

const listOrders = asyncHandler(async (req, res) => {
  const where = {};

  if (req.user.role === 'user') {
    where.userId = req.user.id;
  }

  if (req.user.role === 'restaurant') {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant profile not found.');
    }

    where.restaurantId = restaurant.id;
  }

  if (req.user.role === 'rider') {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) {
      throw new ApiError(404, 'Rider profile not found.');
    }

    where.riderId = rider.id;
  }

  const orders = await Order.findAll({
    where,
    include: [
      { model: OrderItem, as: 'items', include: [{ model: FoodItem, as: 'foodItem' }] },
      { model: Restaurant, as: 'restaurant' },
      { model: User, as: 'customer', attributes: ['id', 'fullName', 'phone'] },
      {
        model: Rider,
        as: 'rider',
        include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'phone'] }],
      },
    ],
    order: [['id', 'DESC']],
  });

  return sendSuccess(res, orders, 'Orders fetched.');
});

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await loadOrderById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (req.user.role === 'user' && order.userId !== req.user.id) {
    throw new ApiError(403, 'Forbidden.');
  }

  if (req.user.role === 'restaurant') {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant || order.restaurantId !== restaurant.id) {
      throw new ApiError(403, 'Forbidden.');
    }
  }

  if (req.user.role === 'rider') {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider || order.riderId !== rider.id) {
      throw new ApiError(403, 'Forbidden.');
    }
  }

  return sendSuccess(res, order, 'Order fetched.');
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const currentStatus = order.status;

  if (!allowedTransitions[currentStatus].includes(status)) {
    throw new ApiError(409, `Cannot move order from ${currentStatus} to ${status}.`);
  }

  const allowedRoles = statusUpdaters[status] || [];
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to set this status.');
  }

  if (req.user.role === 'restaurant') {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant || order.restaurantId !== restaurant.id) {
      throw new ApiError(403, 'You cannot update this order.');
    }
  }

  if (req.user.role === 'rider') {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider || order.riderId !== rider.id) {
      throw new ApiError(403, 'You cannot update this order.');
    }
  }

  if (req.user.role === 'user' && order.userId !== req.user.id) {
    throw new ApiError(403, 'You cannot update this order.');
  }

  await order.update({ status });

  await OrderStatusHistory.create({
    orderId: order.id,
    status,
    changedBy: req.user.id,
    note: note || `Status changed to ${status}`,
  });

  const fullOrder = await loadOrderById(order.id);
  emitOrderUpdate(fullOrder);

  return sendSuccess(res, fullOrder, 'Order status updated.');
});

const assignRider = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { riderId } = req.body;

  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const rider = await Rider.findOne({
    where: {
      id: riderId,
      approvalStatus: 'approved',
      isAvailable: true,
    },
  });

  if (!rider) {
    throw new ApiError(404, 'Rider not found or unavailable.');
  }

  await order.update({ riderId: rider.id });

  await OrderStatusHistory.create({
    orderId: order.id,
    status: order.status,
    changedBy: req.user.id,
    note: `Rider ${rider.id} assigned to order`,
  });

  const fullOrder = await loadOrderById(order.id);
  emitOrderUpdate(fullOrder);

  return sendSuccess(res, fullOrder, 'Rider assigned successfully.');
});

const getAvailableRiders = asyncHandler(async (_req, res) => {
  const riders = await Rider.findAll({
    where: {
      approvalStatus: 'approved',
      isAvailable: true,
    },
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'phone'] }],
    order: [['id', 'DESC']],
  });

  return sendSuccess(res, riders, 'Available riders fetched.');
});

const getOrderTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await loadOrderById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (order.userId !== req.user.id && req.user.role === 'user') {
    throw new ApiError(403, 'Forbidden.');
  }

  return sendSuccess(
    res,
    {
      id: order.id,
      status: order.status,
      rider: order.rider,
      statusHistory: order.statusHistory,
      updatedAt: order.updatedAt,
    },
    'Order tracking fetched.'
  );
});

const searchOrders = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can search across all orders.');
  }

  const query = req.query.q?.trim();
  if (!query) {
    return sendSuccess(res, [], 'No query provided.');
  }

  const orders = await Order.findAll({
    where: {
      [Op.or]: [
        { status: { [Op.like]: `%${query}%` } },
        { paymentStatus: { [Op.like]: `%${query}%` } },
      ],
    },
    include: [{ model: User, as: 'customer', attributes: ['id', 'fullName', 'email'] }],
    limit: 100,
    order: [['id', 'DESC']],
  });

  return sendSuccess(res, orders, 'Search results fetched.');
});

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  assignRider,
  getAvailableRiders,
  getOrderTracking,
  searchOrders,
};
