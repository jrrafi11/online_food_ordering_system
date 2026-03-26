const router = require('express').Router();
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/allowRoles');
const { upload } = require('../config/cloudinary');
const {
  createRiderProfile,
  getMyRiderProfile,
  updateRiderProfile,
  uploadRiderProfileImage,
  updateLocation,
  toggleAvailability,
  getAssignedOrders,
} = require('../controllers/riderController');

router.post('/profile', auth, allowRoles('rider', 'admin'), createRiderProfile);
router.get('/profile/me', auth, allowRoles('rider', 'admin'), getMyRiderProfile);
router.patch('/profile/me', auth, allowRoles('rider', 'admin'), updateRiderProfile);
router.patch(
  '/profile/me/image',
  auth,
  allowRoles('rider', 'admin'),
  upload.single('profileImage'),
  uploadRiderProfileImage
);
router.patch('/location', auth, allowRoles('rider', 'admin'), updateLocation);
router.patch('/availability', auth, allowRoles('rider', 'admin'), toggleAvailability);
router.get('/deliveries', auth, allowRoles('rider', 'admin'), getAssignedOrders);

module.exports = router;
