const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createOrderValidation,
  updateStatusValidation,
} = require('../validators/orderValidator');
const {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  assignRider,
  getAvailableRiders,
  getOrderTracking,
  searchOrders,
} = require('../controllers/orderController');

router.use(auth);

router.get('/', listOrders);
router.get('/search', searchOrders);
router.get('/available-riders', getAvailableRiders);
router.get('/:orderId', getOrderById);
router.get('/:orderId/tracking', getOrderTracking);
router.post('/', createOrderValidation, validate, createOrder);
router.patch('/:orderId/status', updateStatusValidation, validate, updateOrderStatus);
router.patch('/:orderId/assign-rider', assignRider);

module.exports = router;
