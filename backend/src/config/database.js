const path = require('path');
const { Sequelize } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'sqlite';
const enableLogging = String(process.env.DB_LOGGING || 'false').toLowerCase() === 'true';
const sqliteStoragePath = process.env.DB_STORAGE || 'dev.sqlite';
const resolvedSqliteStoragePath =
  sqliteStoragePath === ':memory:'
    ? ':memory:'
    : path.isAbsolute(sqliteStoragePath)
      ? sqliteStoragePath
      : path.resolve(__dirname, '..', '..', sqliteStoragePath);

const sequelize =
  dialect === 'sqlite'
    ? new Sequelize({
        dialect: 'sqlite',
        storage: resolvedSqliteStoragePath,
        logging: enableLogging ? console.log : false,
      })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT || 3306),
          dialect: 'mysql',
          logging: enableLogging ? console.log : false,
          pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        }
      );

module.exports = sequelize;
