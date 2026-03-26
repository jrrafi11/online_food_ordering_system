const router = require('express').Router();
const auth = require('../middleware/auth');
const { processMockPayment } = require('../controllers/paymentController');

router.post('/mock', auth, processMockPayment);

module.exports = router;
