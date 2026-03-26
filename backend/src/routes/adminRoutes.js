const router = require('express').Router();
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/allowRoles');
const {
  getDashboardMetrics,
  listUsers,
  listPendingRestaurants,
  approveRestaurant,
  listPendingRiders,
  approveRider,
} = require('../controllers/adminController');

router.use(auth, allowRoles('admin'));

router.get('/dashboard', getDashboardMetrics);
router.get('/users', listUsers);
router.get('/restaurants/pending', listPendingRestaurants);
router.patch('/restaurants/:restaurantId/approval', approveRestaurant);
router.get('/riders/pending', listPendingRiders);
router.patch('/riders/:riderId/approval', approveRider);

module.exports = router;
