const { Op, fn, col } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');
const { getUploadedFileUrl } = require('../config/cloudinary');
const { Restaurant, FoodItem, Review } = require('../models');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parseCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const parseNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const parseInteger = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback;
  const numberValue = Number.parseInt(value, 10);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const parseBoolean = (value, fallback = null) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

const buildSortOrder = (sort) => {
  switch (sort) {
    case 'newest':
      return [['id', 'DESC']];
    case 'rating_desc':
      return [
        ['ratingAverage', 'DESC'],
        ['ratingCount', 'DESC'],
      ];
    case 'eta_asc':
      return [['deliveryEtaMinutes', 'ASC']];
    case 'delivery_fee_asc':
      return [['deliveryFee', 'ASC']];
    case 'min_order_asc':
      return [['minOrder', 'ASC']];
    case 'name_asc':
      return [['name', 'ASC']];
    case 'recommended':
    default:
      return [
        ['featured', 'DESC'],
        ['ratingAverage', 'DESC'],
        ['deliveryEtaMinutes', 'ASC'],
        ['id', 'DESC'],
      ];
  }
};

const getRestaurantReviewStats = async (restaurantIds) => {
  if (!restaurantIds.length) {
    return new Map();
  }

  const rows = await Review.findAll({
    attributes: [
      'restaurantId',
      [fn('AVG', col('rating')), 'avgRating'],
      [fn('COUNT', col('id')), 'totalReviews'],
    ],
    where: {
      restaurantId: {
        [Op.in]: restaurantIds,
      },
    },
    group: ['restaurantId'],
    raw: true,
  });

  const result = new Map();
  rows.forEach((row) => {
    const restaurantId = Number(row.restaurantId);
    result.set(restaurantId, {
      avgRating: Number(row.avgRating || 0),
      totalReviews: Number(row.totalReviews || 0),
    });
  });

  return result;
};

const buildStorefrontRestaurant = (restaurant, reviewStatsMap) => {
  const plain = restaurant.get({ plain: true });
  const reviewStats = reviewStatsMap.get(Number(plain.id));

  const ratingAverageRaw = reviewStats?.avgRating ?? Number(plain.ratingAverage || 0);
  const ratingCountRaw = reviewStats?.totalReviews ?? Number(plain.ratingCount || 0);

  const ratingAverage = Number(Number(ratingAverageRaw).toFixed(1));
  const ratingCount = Number(ratingCountRaw);

  const fallbackBanner = `https://picsum.photos/seed/restaurant-banner-${plain.id}/1080/680`;
  const fallbackLogo = `https://picsum.photos/seed/restaurant-logo-${plain.id}/240/240`;

  const bannerImageUrl = plain.bannerImageUrl || plain.imageUrl || fallbackBanner;
  const logoImageUrl = plain.logoImageUrl || plain.imageUrl || fallbackLogo;

  return {
    ...plain,
    ratingAverage,
    ratingCount,
    deliveryEtaMinutes: Number(plain.deliveryEtaMinutes || 30),
    deliveryFee: Number(plain.deliveryFee || 0),
    minOrder: Number(plain.minOrder || 0),
    featured: Boolean(plain.featured),
    bannerImageUrl,
    logoImageUrl,
    imageUrl: bannerImageUrl,
  };
};

const createRestaurantProfile = asyncHandler(async (req, res) => {
  const existing = await Restaurant.findOne({ where: { userId: req.user.id } });

  if (existing) {
    throw new ApiError(409, 'Restaurant profile already exists.');
  }

  const featured = parseBoolean(req.body.featured, false);

  const restaurant = await Restaurant.create({
    userId: req.user.id,
    name: req.body.name,
    description: req.body.description,
    address: req.body.address,
    latitude: parseCoordinate(req.body.latitude),
    longitude: parseCoordinate(req.body.longitude),
    cuisineType: req.body.cuisineType,
    imageUrl: req.body.imageUrl,
    logoImageUrl: req.body.logoImageUrl,
    bannerImageUrl: req.body.bannerImageUrl,
    deliveryEtaMinutes: parseInteger(req.body.deliveryEtaMinutes, 30),
    deliveryFee: parseNumber(req.body.deliveryFee, 2.5),
    minOrder: parseNumber(req.body.minOrder, 8),
    featured,
  });

  return sendSuccess(res, restaurant, 'Restaurant profile created.', 201);
});

const getMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({
    where: { userId: req.user.id },
    include: [{ model: FoodItem, as: 'menuItems' }],
  });

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant profile not found.');
  }

  const reviewStatsMap = await getRestaurantReviewStats([restaurant.id]);
  const payload = buildStorefrontRestaurant(restaurant, reviewStatsMap);

  return sendSuccess(res, payload, 'Restaurant profile fetched.');
});

const listRestaurants = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim() || '';
  const cuisine = req.query.cuisine?.trim();
  const featured = parseBoolean(req.query.featured, null);
  const sort = req.query.sort || 'recommended';
  const page = clamp(parseInteger(req.query.page, 1) || 1, 1, 10000);
  const limit = clamp(parseInteger(req.query.limit, 12) || 12, 1, 50);
  const offset = (page - 1) * limit;

  const where = { approvalStatus: 'approved' };

  if (q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
      { cuisineType: { [Op.like]: `%${q}%` } },
      { address: { [Op.like]: `%${q}%` } },
    ];
  }

  if (cuisine && cuisine.toLowerCase() !== 'all') {
    where.cuisineType = { [Op.like]: `%${cuisine}%` };
  }

  if (featured !== null) {
    where.featured = featured;
  }

  const result = await Restaurant.findAndCountAll({
    where,
    include: [
      {
        model: FoodItem,
        as: 'menuItems',
        where: { isAvailable: true },
        required: false,
      },
    ],
    order: buildSortOrder(sort),
    limit,
    offset,
    distinct: true,
  });

  const restaurantIds = result.rows.map((row) => row.id);
  const reviewStatsMap = await getRestaurantReviewStats(restaurantIds);
  const restaurants = result.rows.map((restaurant) =>
    buildStorefrontRestaurant(restaurant, reviewStatsMap)
  );

  const total = typeof result.count === 'number' ? result.count : result.count.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return res.status(200).json({
    success: true,
    message: 'Restaurants fetched.',
    data: restaurants,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      filters: {
        q,
        cuisine: cuisine || null,
        sort,
        featured,
      },
    },
  });
});

const getRestaurantById = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findOne({
    where: {
      id: restaurantId,
      approvalStatus: 'approved',
    },
    include: [
      {
        model: FoodItem,
        as: 'menuItems',
        where: { isAvailable: true },
        required: false,
      },
    ],
  });

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }

  const reviewStatsMap = await getRestaurantReviewStats([restaurant.id]);
  const payload = buildStorefrontRestaurant(restaurant, reviewStatsMap);

  return sendSuccess(res, payload, 'Restaurant fetched.');
});

const updateRestaurantProfile = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant profile not found.');
  }

  const updates = {
    name: req.body.name ?? restaurant.name,
    description: req.body.description ?? restaurant.description,
    address: req.body.address ?? restaurant.address,
    cuisineType: req.body.cuisineType ?? restaurant.cuisineType,
    imageUrl: req.body.imageUrl ?? restaurant.imageUrl,
    logoImageUrl: req.body.logoImageUrl ?? restaurant.logoImageUrl,
    bannerImageUrl: req.body.bannerImageUrl ?? restaurant.bannerImageUrl,
    deliveryEtaMinutes:
      parseInteger(req.body.deliveryEtaMinutes, null) ?? restaurant.deliveryEtaMinutes,
    deliveryFee: parseNumber(req.body.deliveryFee, null) ?? restaurant.deliveryFee,
    minOrder: parseNumber(req.body.minOrder, null) ?? restaurant.minOrder,
    featured: parseBoolean(req.body.featured, restaurant.featured),
  };

  if (Object.prototype.hasOwnProperty.call(req.body, 'latitude')) {
    updates.latitude = parseCoordinate(req.body.latitude);
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'longitude')) {
    updates.longitude = parseCoordinate(req.body.longitude);
  }

  await restaurant.update(updates);

  return sendSuccess(res, restaurant, 'Restaurant profile updated.');
});

const uploadRestaurantProfileImage = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const validTypes = new Set(['banner', 'logo', 'cover']);

  if (!validTypes.has(type)) {
    throw new ApiError(400, 'Invalid image type. Use banner, logo, or cover.');
  }

  if (!req.file) {
    throw new ApiError(400, 'Image file is required.');
  }

  const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant profile not found.');
  }

  const imageUrl = getUploadedFileUrl(req, req.file);
  if (!imageUrl) {
    throw new ApiError(500, 'Failed to process uploaded image.');
  }

  const updates = {};
  if (type === 'banner') {
    updates.bannerImageUrl = imageUrl;
    updates.imageUrl = imageUrl;
  }

  if (type === 'logo') {
    updates.logoImageUrl = imageUrl;
  }

  if (type === 'cover') {
    updates.imageUrl = imageUrl;
  }

  await restaurant.update(updates);

  return sendSuccess(
    res,
    {
      type,
      imageUrl,
      restaurant,
    },
    'Restaurant image uploaded.'
  );
});

const uploadMenuItemImage = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  if (!req.file) {
    throw new ApiError(400, 'Food image file is required.');
  }

  const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant profile not found.');
  }

  const item = await FoodItem.findOne({
    where: {
      id: itemId,
      restaurantId: restaurant.id,
    },
  });

  if (!item) {
    throw new ApiError(404, 'Menu item not found.');
  }

  const imageUrl = getUploadedFileUrl(req, req.file);
  if (!imageUrl) {
    throw new ApiError(500, 'Failed to process uploaded image.');
  }

  await item.update({ imageUrl });

  return sendSuccess(
    res,
    {
      itemId: item.id,
      imageUrl,
      item,
    },
    'Menu item image updated.'
  );
});

const addMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant profile not found.');
  }

  const item = await FoodItem.create({
    restaurantId: restaurant.id,
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
    isAvailable: req.body.isAvailable ?? true,
  });

  return sendSuccess(res, item, 'Menu item created.', 201);
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant profile not found.');
  }

  const item = await FoodItem.findOne({
    where: {
      id: itemId,
      restaurantId: restaurant.id,
    },
  });

  if (!item) {
    throw new ApiError(404, 'Menu item not found.');
  }

  await item.update(req.body);

  return sendSuccess(res, item, 'Menu item updated.');
});

const getRestaurantMenu = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const menu = await FoodItem.findAll({
    where: {
      restaurantId,
      isAvailable: true,
    },
    order: [
      ['category', 'ASC'],
      ['name', 'ASC'],
    ],
  });

  return sendSuccess(res, menu, 'Menu fetched.');
});

module.exports = {
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
};

