const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
});
const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const { initSocket } = require('./services/socketService');

const port = Number(process.env.PORT || 5000);
const shouldSyncDb = String(process.env.DB_SYNC || 'true').toLowerCase() === 'true';
const shouldAlterDb = String(process.env.DB_ALTER || 'true').toLowerCase() === 'true';
const jwtSecret = String(process.env.JWT_SECRET || '').trim();

if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET is missing. Set JWT_SECRET in backend/.env before starting the backend.'
  );
}

const cleanupSqliteBackupTables = async () => {
  if (sequelize.getDialect() !== 'sqlite' || !shouldAlterDb) {
    return;
  }

  const [backupTables] = await sequelize.query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup';"
  );

  for (const table of backupTables) {
    if (table?.name) {
      await sequelize.getQueryInterface().dropTable(table.name);
    }
  }
};

const syncDatabase = async () => {
  if (!shouldSyncDb) {
    return;
  }

  const isSqliteAlter = sequelize.getDialect() === 'sqlite' && shouldAlterDb;
  if (!isSqliteAlter) {
    await sequelize.sync({ alter: shouldAlterDb });
    return;
  }

  await cleanupSqliteBackupTables();
  await sequelize.query('PRAGMA foreign_keys = OFF;');

  try {
    await sequelize.sync({ alter: true });
  } catch (error) {
    if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
      throw error;
    }

    console.warn(
      'SQLite alter sync failed; recreating schema with force sync to keep local dev unblocked.'
    );
    await sequelize.sync({ force: true });
  } finally {
    await sequelize.query('PRAGMA foreign_keys = ON;');
  }
};

const startServer = async () => {
  try {
    await sequelize.authenticate();

    await syncDatabase();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
};

startServer();
