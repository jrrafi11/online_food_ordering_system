const router = require('express').Router();
const { register, registerCustomer, login, me } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerValidation,
  registerCustomerValidation,
  loginValidation,
} = require('../validators/authValidator');

router.post('/register', registerValidation, validate, register);
router.post('/register-customer', registerCustomerValidation, validate, registerCustomer);
router.post('/login', loginValidation, validate, login);
router.get('/me', auth, me);

module.exports = router;
