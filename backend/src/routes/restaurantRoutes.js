const router = require('express').Router();
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/allowRoles');
const validate = require('../middleware/validate');
const { upload } = require('../config/cloudinary');
const {
  createRestaurantProfile,
  getMyRestaurant,
  listRestaurants,
  getRestaurantById,
  updateRestaurantProfile,
  uploadRestaurantProfileImage,
  addMenuItem,
  uploadMenuItemImage,
  updateMenuItem,
  getRestaurantMenu,
} = require('../controllers/restaurantController');
const {
  createRestaurantValidation,
  createMenuItemValidation,
  updateRestaurantValidation,
} = require('../validators/restaurantValidator');

router.get('/', listRestaurants);

router.post(
  '/profile',
  auth,
  allowRoles('restaurant', 'admin'),
  createRestaurantValidation,
  validate,
  createRestaurantProfile
);
router.get('/profile/me', auth, allowRoles('restaurant', 'admin'), getMyRestaurant);
router.patch(
  '/profile/me',
  auth,
  allowRoles('restaurant', 'admin'),
  updateRestaurantValidation,
  validate,
  updateRestaurantProfile
);
router.patch(
  '/profile/me/images/:type',
  auth,
  allowRoles('restaurant', 'admin'),
  upload.single('restaurantImage'),
  uploadRestaurantProfileImage
);
router.post(
  '/menu',
  auth,
  allowRoles('restaurant', 'admin'),
  createMenuItemValidation,
  validate,
  addMenuItem
);
router.patch('/menu/:itemId', auth, allowRoles('restaurant', 'admin'), updateMenuItem);
router.patch(
  '/menu/:itemId/image',
  auth,
  allowRoles('restaurant', 'admin'),
  upload.single('foodImage'),
  uploadMenuItemImage
);
router.get('/:restaurantId/menu', getRestaurantMenu);
router.get('/:restaurantId', getRestaurantById);

module.exports = router;
