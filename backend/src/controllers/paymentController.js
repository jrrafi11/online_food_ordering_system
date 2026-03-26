const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');
const { Payment, Order } = require('../models');

const processMockPayment = asyncHandler(async (req, res) => {
  const { orderId, provider } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to pay this order.');
  }

  const payment = await Payment.create({
    orderId: order.id,
    provider: provider || order.paymentMethod,
    transactionId: `mock-${Date.now()}-${order.id}`,
    amount: order.total,
    currency: 'BDT',
    status: 'paid',
  });

  await order.update({ paymentStatus: 'paid' });

  return sendSuccess(res, payment, 'Mock payment successful.', 201);
});

module.exports = {
  processMockPayment,
};
