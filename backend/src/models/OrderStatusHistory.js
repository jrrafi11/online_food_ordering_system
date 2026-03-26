const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderStatusHistory = sequelize.define(
  'OrderStatusHistory',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    changedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'order_status_history',
    underscored: true,
  }
);

module.exports = OrderStatusHistory;
