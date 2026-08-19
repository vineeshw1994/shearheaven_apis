-- Shear Heaven - Update existing production tables
-- Use this if tables were already created with groomerId.
-- Run: mysql -u root -p shear_heaven < scripts/schedule-tables-update.sql

USE shear_heaven;

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 1. Master tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `client_master` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `clientId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_master_client_id_unique` (`clientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `region_master` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `regionId` VARCHAR(50) NOT NULL,
  `clientId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `region_master_client_region_unique` (`clientId`, `regionId`),
  KEY `region_master_client_id` (`clientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `store_master` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `storeId` VARCHAR(50) NOT NULL,
  `clientId` VARCHAR(50) NOT NULL,
  `regionId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `store_master_store_tenant_unique` (`storeId`, `clientId`, `regionId`),
  KEY `store_master_client_region` (`clientId`, `regionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `client_master` (`clientId`, `name`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('SHEAR-001', 'Shear Heaven', 1, NOW(), NOW());

INSERT IGNORE INTO `region_master` (`regionId`, `clientId`, `name`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('DWG-001', 'SHEAR-001', 'Darwin', 1, NOW(), NOW());

INSERT IGNORE INTO `store_master` (`storeId`, `clientId`, `regionId`, `name`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('SHEAR-001', 'SHEAR-001', 'DWG-001', 'Shear Heaven Darwin', 1, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 2. Switch groomer_working_hours from groomerId to groomerCode
-- ---------------------------------------------------------------------------
SET @has_groomer_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groomer_working_hours' AND COLUMN_NAME = 'groomerId'
);
SET @has_groomer_code := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groomer_working_hours' AND COLUMN_NAME = 'groomerCode'
);

SET @sql := IF(@has_groomer_code = 0 AND @has_groomer_id > 0,
  'ALTER TABLE `groomer_working_hours` ADD COLUMN `groomerCode` VARCHAR(50) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@has_groomer_id > 0,
  'UPDATE `groomer_working_hours` t INNER JOIN `groomers` g ON g.id = t.groomerId SET t.groomerCode = g.groomerCode',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Drop old FK if present
SET @fk := (
  SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groomer_working_hours'
    AND COLUMN_NAME = 'groomerId' AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);
SET @sql := IF(@fk IS NOT NULL, CONCAT('ALTER TABLE `groomer_working_hours` DROP FOREIGN KEY `', @fk, '`'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (
  SELECT INDEX_NAME FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groomer_working_hours' AND COLUMN_NAME = 'groomerId'
  LIMIT 1
);
SET @sql := IF(@idx IS NOT NULL, CONCAT('ALTER TABLE `groomer_working_hours` DROP INDEX `', @idx, '`'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@has_groomer_id > 0, 'ALTER TABLE `groomer_working_hours` DROP COLUMN `groomerId`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `groomer_working_hours` MODIFY `groomerCode` VARCHAR(50) NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Switch groomer_unavailability from groomerId to groomerCode
-- ---------------------------------------------------------------------------
SET @has_groomer_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groomer_unavailability' AND COLUMN_NAME = 'groomerId'
);
SET @has_groomer_code := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groomer_unavailability' AND COLUMN_NAME = 'groomerCode'
);

SET @sql := IF(@has_groomer_code = 0 AND @has_groomer_id > 0,
  'ALTER TABLE `groomer_unavailability` ADD COLUMN `groomerCode` VARCHAR(50) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@has_groomer_id > 0,
  'UPDATE `groomer_unavailability` t INNER JOIN `groomers` g ON g.id = t.groomerId SET t.groomerCode = g.groomerCode',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk := (
  SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groomer_unavailability'
    AND COLUMN_NAME = 'groomerId' AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);
SET @sql := IF(@fk IS NOT NULL, CONCAT('ALTER TABLE `groomer_unavailability` DROP FOREIGN KEY `', @fk, '`'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (
  SELECT INDEX_NAME FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'groomer_unavailability' AND COLUMN_NAME = 'groomerId'
  LIMIT 1
);
SET @sql := IF(@idx IS NOT NULL, CONCAT('ALTER TABLE `groomer_unavailability` DROP INDEX `', @idx, '`'), 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@has_groomer_id > 0, 'ALTER TABLE `groomer_unavailability` DROP COLUMN `groomerId`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `groomer_unavailability` MODIFY `groomerCode` VARCHAR(50) NOT NULL;
