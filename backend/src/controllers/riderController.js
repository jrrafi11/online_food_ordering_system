const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');
const { getUploadedFileUrl } = require('../config/cloudinary');
const { Rider, Order, User } = require('../models');

const VEHICLE_TYPES = new Set(['bike', 'car', 'bicycle', 'scooter']);

const normalizeVehicleType = (value, fallback = 'bike') => {
  if (!value) return fallback;
  const normalized = String(value).toLowerCase();
  return VEHICLE_TYPES.has(normalized) ? normalized : null;
};

const createRiderProfile = asyncHandler(async (req, res) => {
  const existing = await Rider.findOne({ where: { userId: req.user.id } });

  if (existing) {
    throw new ApiError(409, 'Rider profile already exists.');
  }

  const vehicleType = normalizeVehicleType(req.body.vehicleType, 'bike');
  if (!vehicleType) {
    throw new ApiError(400, 'Invalid vehicle type.');
  }

  const rider = await Rider.create({
    userId: req.user.id,
    vehicleType,
    profileImageUrl: req.body.profileImageUrl,
    currentLatitude: req.body.currentLatitude,
    currentLongitude: req.body.currentLongitude,
  });

  return sendSuccess(res, rider, 'Rider profile created.', 201);
});

const getMyRiderProfile = asyncHandler(async (req, res) => {
  const rider = await Rider.findOne({ where: { userId: req.user.id } });

  if (!rider) {
    throw new ApiError(404, 'Rider profile not found.');
  }

  return sendSuccess(res, rider, 'Rider profile fetched.');
});

const updateRiderProfile = asyncHandler(async (req, res) => {
  const rider = await Rider.findOne({ where: { userId: req.user.id } });

  if (!rider) {
    throw new ApiError(404, 'Rider profile not found.');
  }

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(req.body, 'vehicleType')) {
    const vehicleType = normalizeVehicleType(req.body.vehicleType, rider.vehicleType);
    if (!vehicleType) {
      throw new ApiError(400, 'Invalid vehicle type.');
    }
    updates.vehicleType = vehicleType;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'profileImageUrl')) {
    updates.profileImageUrl = req.body.profileImageUrl || null;
  }

  if (Object.keys(updates).length === 0) {
    return sendSuccess(res, rider, 'No changes applied.');
  }

  await rider.update(updates);

  return sendSuccess(res, rider, 'Rider profile updated.');
});

const uploadRiderProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Image file is required.');
  }

  const rider = await Rider.findOne({ where: { userId: req.user.id } });

  if (!rider) {
    throw new ApiError(404, 'Rider profile not found.');
  }

  const imageUrl = getUploadedFileUrl(req, req.file);

  if (!imageUrl) {
    throw new ApiError(500, 'Failed to process uploaded image.');
  }

  await rider.update({ profileImageUrl: imageUrl });

  return sendSuccess(
    res,
    { profileImageUrl: imageUrl, rider },
    'Rider profile image uploaded.'
  );
});

const updateLocation = asyncHandler(async (req, res) => {
  const rider = await Rider.findOne({ where: { userId: req.user.id } });

  if (!rider) {
    throw new ApiError(404, 'Rider profile not found.');
  }

  await rider.update({
    currentLatitude: req.body.currentLatitude,
    currentLongitude: req.body.currentLongitude,
  });

  return sendSuccess(res, rider, 'Location updated.');
});

const toggleAvailability = asyncHandler(async (req, res) => {
  const rider = await Rider.findOne({ where: { userId: req.user.id } });

  if (!rider) {
    throw new ApiError(404, 'Rider profile not found.');
  }

  await rider.update({ isAvailable: !rider.isAvailable });

  return sendSuccess(res, rider, 'Availability updated.');
});

const getAssignedOrders = asyncHandler(async (req, res) => {
  const rider = await Rider.findOne({ where: { userId: req.user.id } });

  if (!rider) {
    throw new ApiError(404, 'Rider profile not found.');
  }

  const orders = await Order.findAll({
    where: { riderId: rider.id },
    include: [{ model: User, as: 'customer', attributes: ['id', 'fullName', 'phone'] }],
    order: [['id', 'DESC']],
  });

  return sendSuccess(res, orders, 'Assigned orders fetched.');
});

module.exports = {
  createRiderProfile,
  getMyRiderProfile,
  updateRiderProfile,
  uploadRiderProfileImage,
  updateLocation,
  toggleAvailability,
  getAssignedOrders,
};
