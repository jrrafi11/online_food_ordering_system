const sequelize = require('../config/database');
const User = require('./User');
const Address = require('./Address');
const Restaurant = require('./Restaurant');
const Rider = require('./Rider');
const FoodItem = require('./FoodItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const OrderStatusHistory = require('./OrderStatusHistory');
const Review = require('./Review');
const Payment = require('./Payment');

User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Restaurant, { foreignKey: 'userId', as: 'restaurantProfile' });
Restaurant.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

User.hasOne(Rider, { foreignKey: 'userId', as: 'riderProfile' });
Rider.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Restaurant.hasMany(FoodItem, { foreignKey: 'restaurantId', as: 'menuItems' });
FoodItem.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

Rider.hasMany(Order, { foreignKey: 'riderId', as: 'deliveries' });
Order.belongsTo(Rider, { foreignKey: 'riderId', as: 'rider' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

FoodItem.hasMany(OrderItem, { foreignKey: 'foodItemId', as: 'orderItems' });
OrderItem.belongsTo(FoodItem, { foreignKey: 'foodItemId', as: 'foodItem' });

Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Restaurant.hasMany(Review, { foreignKey: 'restaurantId', as: 'reviews' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

Order.hasOne(Review, { foreignKey: 'orderId', as: 'review' });
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  sequelize,
  User,
  Address,
  Restaurant,
  Rider,
  FoodItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  Review,
  Payment,
};
