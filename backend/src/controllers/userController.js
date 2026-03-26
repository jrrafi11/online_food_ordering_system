const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');
const { User, Address } = require('../models');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Address, as: 'addresses' }],
  });

  return sendSuccess(res, user, 'Profile fetched.');
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;

  await req.user.update({
    fullName: fullName ?? req.user.fullName,
    phone: phone ?? req.user.phone,
  });

  const updatedUser = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });

  return sendSuccess(res, updatedUser, 'Profile updated.');
});

const addAddress = asyncHandler(async (req, res) => {
  const { label, line1, line2, city, state, postalCode, latitude, longitude, isDefault } = req.body;

  if (!line1 || !city) {
    throw new ApiError(422, 'line1 and city are required.');
  }

  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  }

  const address = await Address.create({
    userId: req.user.id,
    label: label || 'home',
    line1,
    line2,
    city,
    state,
    postalCode,
    latitude,
    longitude,
    isDefault: Boolean(isDefault),
  });

  return sendSuccess(res, address, 'Address added.', 201);
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOne({ where: { id: addressId, userId: req.user.id } });

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  await address.update({ isDefault: true });

  return sendSuccess(res, address, 'Default address updated.');
});

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  setDefaultAddress,
};
