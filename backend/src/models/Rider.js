const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rider = sequelize.define(
  'Rider',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    vehicleType: {
      type: DataTypes.ENUM('bike', 'car', 'bicycle', 'scooter'),
      defaultValue: 'bike',
    },
    profileImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentLatitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    currentLongitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    approvalStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'riders',
    underscored: true,
  }
);

module.exports = Rider;
