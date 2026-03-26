const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');
const { User, Restaurant, Rider } = require('../models');
const { generateToken } = require('../services/tokenService');

const sanitizeUser = (user) => {
  const plain = user.get({ plain: true });
  delete plain.password;
  return plain;
};

const createUserWithToken = async ({ fullName, email, password, phone, role }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
    role,
  });

  const token = generateToken(user);

  return {
    token,
    user: sanitizeUser(user),
  };
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;

  const payload = await createUserWithToken({
    fullName,
    email,
    password,
    phone,
    role: role || 'user',
  });

  return sendSuccess(res, payload, 'Registration successful.', 201);
});

const registerCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;
  const payload = await createUserWithToken({
    fullName,
    email,
    password,
    phone,
    role: 'user',
  });

  return sendSuccess(
    res,
    payload,
    'Customer registration successful.',
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user);

  return sendSuccess(res, { token, user: sanitizeUser(user) }, 'Login successful.');
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Restaurant, as: 'restaurantProfile' },
      { model: Rider, as: 'riderProfile' },
    ],
  });

  return sendSuccess(res, user, 'Current user fetched.');
});

module.exports = {
  register,
  registerCustomer,
  login,
  me,
};
