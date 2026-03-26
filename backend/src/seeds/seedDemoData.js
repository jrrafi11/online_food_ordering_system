require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Restaurant,
  Rider,
  FoodItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
} = require('../models');

const hashPassword = (plain) => bcrypt.hash(plain, 10);

const seed = async () => {
  await sequelize.sync({ force: true });

  const [adminPass, userPass, restaurantPass, riderPass] = await Promise.all([
    hashPassword('admin123'),
    hashPassword('user1234'),
    hashPassword('rest1234'),
    hashPassword('rider123'),
  ]);

  const admin = await User.create({
    fullName: 'Admin User',
    email: 'admin@food.local',
    password: adminPass,
    role: 'admin',
  });

  const customer = await User.create({
    fullName: 'Demo Customer',
    email: 'user@food.local',
    password: userPass,
    role: 'user',
    phone: '+880100000000',
  });

  const restaurantOwner = await User.create({
    fullName: 'Demo Restaurant Owner',
    email: 'restaurant@food.local',
    password: restaurantPass,
    role: 'restaurant',
  });

  const riderUser = await User.create({
    fullName: 'Demo Rider',
    email: 'rider@food.local',
    password: riderPass,
    role: 'rider',
    phone: '+880100000001',
  });

  const restaurant = await Restaurant.create({
    userId: restaurantOwner.id,
    name: 'Spice Garden',
    description: 'Fast and tasty fusion meals.',
    address: '42 Lake Road, Dhaka',
    latitude: 23.7806366,
    longitude: 90.4193257,
    cuisineType: 'Fusion',
    featured: true,
    deliveryEtaMinutes: 25,
    deliveryFee: 1.99,
    minOrder: 6,
    ratingAverage: 4.7,
    ratingCount: 132,
    approvalStatus: 'approved',
    imageUrl: 'https://picsum.photos/seed/spice-garden/1080/680',
  });

  const rider = await Rider.create({
    userId: riderUser.id,
    vehicleType: 'bike',
    currentLatitude: 23.771607,
    currentLongitude: 90.40586,
    approvalStatus: 'approved',
  });

  const menu = await FoodItem.bulkCreate([
    {
      restaurantId: restaurant.id,
      name: 'Chicken Biryani',
      description: 'Aromatic basmati rice with chicken.',
      category: 'Main',
      price: 8.5,
    },
    {
      restaurantId: restaurant.id,
      name: 'Beef Kebab',
      description: 'Chargrilled beef kebab skewers.',
      category: 'Main',
      price: 6.25,
    },
  ]);

  const order = await Order.create({
    userId: customer.id,
    restaurantId: restaurant.id,
    riderId: rider.id,
    status: 'delivered',
    subtotal: 14.75,
    deliveryFee: 2.5,
    total: 17.25,
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    deliveryAddress: 'Flat 7B, Dhanmondi, Dhaka',
  });

  await OrderItem.bulkCreate([
    {
      orderId: order.id,
      foodItemId: menu[0].id,
      quantity: 1,
      unitPrice: menu[0].price,
      totalPrice: menu[0].price,
    },
    {
      orderId: order.id,
      foodItemId: menu[1].id,
      quantity: 1,
      unitPrice: menu[1].price,
      totalPrice: menu[1].price,
    },
  ]);

  await OrderStatusHistory.bulkCreate([
    { orderId: order.id, status: 'pending', changedBy: customer.id, note: 'Order placed.' },
    { orderId: order.id, status: 'confirmed', changedBy: restaurantOwner.id, note: 'Order confirmed.' },
    { orderId: order.id, status: 'preparing', changedBy: restaurantOwner.id, note: 'Preparing meal.' },
    { orderId: order.id, status: 'picked_up', changedBy: riderUser.id, note: 'Picked up by rider.' },
    { orderId: order.id, status: 'delivered', changedBy: riderUser.id, note: 'Delivered to customer.' },
  ]);

  await Payment.create({
    orderId: order.id,
    provider: 'cod',
    transactionId: `seed-${order.id}`,
    amount: order.total,
    status: 'paid',
  });

  console.log('Seed complete.');
  console.log({
    admin: admin.email,
    customer: customer.email,
    restaurant: restaurantOwner.email,
    rider: riderUser.email,
    passwordHint: 'admin123/user1234/rest1234/rider123',
  });

  await sequelize.close();
};

seed().catch(async (error) => {
  console.error(error);
  await sequelize.close();
  process.exit(1);
});
