const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReview, getRestaurantReviews } = require('../controllers/reviewController');
const { createReviewValidation } = require('../validators/reviewValidator');

router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.post('/', auth, createReviewValidation, validate, createReview);

module.exports = router;
