const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  addAddress,
  setDefaultAddress,
} = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.post('/addresses', auth, addAddress);
router.patch('/addresses/:addressId/default', auth, setDefaultAddress);

module.exports = router;
