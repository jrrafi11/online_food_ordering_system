process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'test-secret';
process.env.DB_SYNC = 'false';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { sequelize, User, Restaurant, FoodItem } = require('../src/models');

describe('Auth + Order + Discovery API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true });

    const ownerA = await User.create({
      fullName: 'Restaurant Owner A',
      email: 'owner-a@test.local',
      password: await bcrypt.hash('owner123', 10),
      role: 'restaurant',
    });

    const ownerB = await User.create({
      fullName: 'Restaurant Owner B',
      email: 'owner-b@test.local',
      password: await bcrypt.hash('owner123', 10),
      role: 'restaurant',
    });

    const ownerC = await User.create({
      fullName: 'Restaurant Owner C',
      email: 'owner-c@test.local',
      password: await bcrypt.hash('owner123', 10),
      role: 'restaurant',
    });

    const restaurantA = await Restaurant.create({
      userId: ownerA.id,
      name: 'Test Kitchen',
      description: 'Burger and fries',
      cuisineType: 'American',
      address: '123 Test Road',
      approvalStatus: 'approved',
      featured: true,
      deliveryEtaMinutes: 20,
      deliveryFee: 1.5,
      minOrder: 5,
      ratingAverage: 4.6,
      ratingCount: 120,
    });

    const restaurantB = await Restaurant.create({
      userId: ownerB.id,
      name: 'Noodle Hub',
      description: 'Asian noodles',
      cuisineType: 'Asian',
      address: '456 City Street',
      approvalStatus: 'approved',
      featured: false,
      deliveryEtaMinutes: 30,
      deliveryFee: 2.5,
      minOrder: 8,
      ratingAverage: 4.1,
      ratingCount: 60,
    });

    const restaurantC = await Restaurant.create({
      userId: ownerC.id,
      name: 'Pizza House',
      description: 'Italian pizza and pasta',
      cuisineType: 'Italian',
      address: '789 Lake Avenue',
      approvalStatus: 'approved',
      featured: true,
      deliveryEtaMinutes: 15,
      deliveryFee: 3,
      minOrder: 12,
      ratingAverage: 4.8,
      ratingCount: 300,
    });

    await FoodItem.bulkCreate([
      {
        restaurantId: restaurantA.id,
        name: 'Test Burger',
        category: 'Burgers',
        price: 5.5,
        isAvailable: true,
      },
      {
        restaurantId: restaurantB.id,
        name: 'Chicken Noodles',
        category: 'Noodles',
        price: 7.0,
        isAvailable: true,
      },
      {
        restaurantId: restaurantC.id,
        name: 'Margherita Pizza',
        category: 'Pizza',
        price: 9.5,
        isAvailable: true,
      },
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('registers a user and creates an order', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Customer',
      email: 'customer@test.local',
      password: 'password1',
      role: 'user',
    });

    expect(registerRes.status).toBe(201);
    const token = registerRes.body.data.token;
    expect(token).toBeTruthy();

    const restaurantsRes = await request(app).get('/api/v1/restaurants');
    expect(restaurantsRes.status).toBe(200);
    expect(restaurantsRes.body.data.length).toBeGreaterThanOrEqual(1);

    const restaurant = restaurantsRes.body.data[0];
    const item = restaurant.menuItems[0];

    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        restaurantId: restaurant.id,
        deliveryAddress: 'Flat 9, Test City',
        paymentMethod: 'cod',
        items: [{ foodItemId: item.id, quantity: 2 }],
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.status).toBe('pending');
    expect(orderRes.body.data.items.length).toBe(1);
  });

  it('enforces role=user in register-customer endpoint', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register-customer').send({
      fullName: 'Customer Forced Role',
      email: 'forced-customer@test.local',
      password: 'password1',
      role: 'admin',
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.user.role).toBe('user');
  });

  it('supports restaurant discovery filters, sorting, and pagination meta', async () => {
    const listRes = await request(app)
      .get('/api/v1/restaurants')
      .query({ q: 'pizza', cuisine: 'Italian', sort: 'rating_desc', featured: true, page: 1, limit: 1 });

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].name).toBe('Pizza House');

    expect(listRes.body.meta).toBeTruthy();
    expect(listRes.body.meta.page).toBe(1);
    expect(listRes.body.meta.limit).toBe(1);
    expect(listRes.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(listRes.body.meta.filters.q).toBe('pizza');
    expect(listRes.body.meta.filters.cuisine).toBe('Italian');
    expect(listRes.body.meta.filters.featured).toBe(true);
  });
});
