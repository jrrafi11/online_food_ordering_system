const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define(
  'Address',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: 'home',
    },
    line1: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    line2: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'addresses',
    underscored: true,
  }
);

module.exports = Address;
