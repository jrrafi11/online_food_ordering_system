const router = require('express').Router();

router.use('/health', require('./healthRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/restaurants', require('./restaurantRoutes'));
router.use('/riders', require('./riderRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
