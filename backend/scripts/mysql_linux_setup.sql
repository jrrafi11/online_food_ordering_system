-- Online Food Ordering System
-- MySQL database bootstrap script for Linux servers.
--
-- Usage:
--   mysql -u root -p < backend/scripts/mysql_linux_setup.sql
--
-- Update @app_password before running in production.

SET @db_name = 'food_ordering_db';
SET @db_charset = 'utf8mb4';
SET @db_collation = 'utf8mb4_unicode_ci';

SET @app_user = 'foodapp';
SET @app_password = 'change_me_strong_password';
SET @app_host_local = 'localhost';
SET @app_host_loopback = '127.0.0.1';

SET @create_db_sql = CONCAT(
  'CREATE DATABASE IF NOT EXISTS `',
  @db_name,
  '` CHARACTER SET ',
  @db_charset,
  ' COLLATE ',
  @db_collation
);
PREPARE stmt FROM @create_db_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @create_user_local_sql = CONCAT(
  'CREATE USER IF NOT EXISTS ''',
  @app_user,
  '''@''',
  @app_host_local,
  ''' IDENTIFIED BY ''',
  @app_password,
  ''''
);
PREPARE stmt FROM @create_user_local_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @create_user_loopback_sql = CONCAT(
  'CREATE USER IF NOT EXISTS ''',
  @app_user,
  '''@''',
  @app_host_loopback,
  ''' IDENTIFIED BY ''',
  @app_password,
  ''''
);
PREPARE stmt FROM @create_user_loopback_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Keep password in sync if user already exists.
SET @alter_user_local_sql = CONCAT(
  'ALTER USER ''',
  @app_user,
  '''@''',
  @app_host_local,
  ''' IDENTIFIED BY ''',
  @app_password,
  ''''
);
PREPARE stmt FROM @alter_user_local_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @alter_user_loopback_sql = CONCAT(
  'ALTER USER ''',
  @app_user,
  '''@''',
  @app_host_loopback,
  ''' IDENTIFIED BY ''',
  @app_password,
  ''''
);
PREPARE stmt FROM @alter_user_loopback_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @grant_local_sql = CONCAT(
  'GRANT ALL PRIVILEGES ON `',
  @db_name,
  '`.* TO ''',
  @app_user,
  '''@''',
  @app_host_local,
  ''''
);
PREPARE stmt FROM @grant_local_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @grant_loopback_sql = CONCAT(
  'GRANT ALL PRIVILEGES ON `',
  @db_name,
  '`.* TO ''',
  @app_user,
  '''@''',
  @app_host_loopback,
  ''''
);
PREPARE stmt FROM @grant_loopback_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

FLUSH PRIVILEGES;

SELECT 'MySQL setup complete.' AS status;
SELECT CONCAT(
  'Use DB_DIALECT=mysql, DB_NAME=',
  @db_name,
  ', DB_USER=',
  @app_user,
  ' in backend/.env'
) AS next_step;
