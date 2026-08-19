-- Shear Heaven - Schedule tables + sample data
-- Run on production MySQL after deploying the API code.
-- Database: shear_heaven (change USE if needed)

USE shear_heaven;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- MASTER TABLES
-- Client has multiple stores in different regions.
-- Store always has clientId + regionId.
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

-- ---------------------------------------------------------------------------
-- 1. groomers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `groomers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `groomerCode` VARCHAR(50) NOT NULL,
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `role` VARCHAR(100) NOT NULL DEFAULT '',
  `highlights` VARCHAR(500) NOT NULL DEFAULT '',
  `type` ENUM('Groomer', 'Bather') NOT NULL DEFAULT 'Groomer',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `clientId` VARCHAR(50) NOT NULL,
  `regionId` VARCHAR(50) NOT NULL,
  `storeId` VARCHAR(50) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `groomers_code_tenant_unique` (`groomerCode`, `clientId`, `regionId`, `storeId`),
  KEY `groomers_client_id_region_id_store_id` (`clientId`, `regionId`, `storeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- 2. holiday_list
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `holiday_list` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `holidayCode` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `date` DATE NOT NULL,
  `description` VARCHAR(500) NOT NULL DEFAULT '',
  `isStoreSpecific` TINYINT(1) NOT NULL DEFAULT 0,
  `clientId` VARCHAR(50) NOT NULL,
  `regionId` VARCHAR(50) NOT NULL,
  `storeId` VARCHAR(50) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `holiday_list_date` (`date`),
  KEY `holiday_list_client_id_region_id_store_id` (`clientId`, `regionId`, `storeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- 3. store_operational_hours
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `store_operational_hours` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `dayOfWeek` VARCHAR(20) NOT NULL,
  `isOpen` TINYINT(1) NOT NULL DEFAULT 0,
  `startTime` VARCHAR(5) NOT NULL DEFAULT '',
  `endTime` VARCHAR(5) NOT NULL DEFAULT '',
  `clientId` VARCHAR(50) NOT NULL,
  `regionId` VARCHAR(50) NOT NULL,
  `storeId` VARCHAR(50) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `store_hours_day_tenant_unique` (`dayOfWeek`, `clientId`, `regionId`, `storeId`),
  KEY `store_operational_hours_client_id_region_id_store_id` (`clientId`, `regionId`, `storeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- 4. groomer_working_hours (linked by groomerCode)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `groomer_working_hours` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `groomerCode` VARCHAR(50) NOT NULL,
  `dayOfWeek` VARCHAR(20) NOT NULL,
  `isWorking` TINYINT(1) NOT NULL DEFAULT 0,
  `startTime` VARCHAR(5) NOT NULL DEFAULT '',
  `endTime` VARCHAR(5) NOT NULL DEFAULT '',
  `clientId` VARCHAR(50) NOT NULL,
  `regionId` VARCHAR(50) NOT NULL,
  `storeId` VARCHAR(50) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `groomer_hours_code_day_tenant_unique` (`groomerCode`, `dayOfWeek`, `clientId`, `regionId`, `storeId`),
  KEY `groomer_working_hours_groomer_code` (`groomerCode`),
  KEY `groomer_working_hours_client_id_region_id_store_id` (`clientId`, `regionId`, `storeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- 5. groomer_unavailability (linked by groomerCode)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `groomer_unavailability` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `groomerCode` VARCHAR(50) NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `startTime` VARCHAR(5) NOT NULL DEFAULT '',
  `endTime` VARCHAR(5) NOT NULL DEFAULT '',
  `reason` VARCHAR(255) NOT NULL DEFAULT '',
  `leaveType` ENUM('leave', 'break', 'unavailable', 'other') NOT NULL DEFAULT 'unavailable',
  `clientId` VARCHAR(50) NOT NULL,
  `regionId` VARCHAR(50) NOT NULL,
  `storeId` VARCHAR(50) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `groomer_unavailability_groomer_code` (`groomerCode`),
  KEY `groomer_unavailability_start_date_end_date` (`startDate`, `endDate`),
  KEY `groomer_unavailability_client_id_region_id_store_id` (`clientId`, `regionId`, `storeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- SAMPLE DATA
-- ---------------------------------------------------------------------------

INSERT INTO `client_master` (`clientId`, `name`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('SHEAR-001', 'Shear Heaven', 1, NOW(), NOW());

INSERT INTO `region_master` (`regionId`, `clientId`, `name`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('DWG-001', 'SHEAR-001', 'Darwin', 1, NOW(), NOW());

INSERT INTO `store_master` (`storeId`, `clientId`, `regionId`, `name`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('SHEAR-001', 'SHEAR-001', 'DWG-001', 'Shear Heaven Darwin', 1, NOW(), NOW());

INSERT INTO `groomers` (`groomerCode`, `firstName`, `lastName`, `role`, `highlights`, `type`, `isActive`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
VALUES
  ('G001', 'Merisa', 'Brown', 'Lead Groomer', 'Best lead groomer in town', 'Groomer', 1, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', 'Richard', 'Cooke', 'Senior Groomer', 'Best groomer in town, got award in 2025!', 'Groomer', 1, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', 'Jeremiah', 'Smith', 'Junio Bather', 'I am the best Bather', 'Bather', 1, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW());

INSERT INTO `holiday_list` (`holidayCode`, `name`, `date`, `description`, `isStoreSpecific`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
VALUES
  ('H001', 'Independence Day', '2026-07-04', 'Day of Independence', 0, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('H002', 'Easter', '2026-04-28', 'Day of Independence', 0, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('H003', 'Thanks giving day', '2026-11-25', 'Day of Independence', 0, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('H004', 'Christmas Day', '2026-12-25', 'Christmas Day', 0, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('H005', 'Store Maintenance', '2026-08-21', 'Store-specific closure for equipment maintenance', 1, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW());

INSERT INTO `store_operational_hours` (`dayOfWeek`, `isOpen`, `startTime`, `endTime`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
VALUES
  ('Sunday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('Tuesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('Wednesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('Thursday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('Friday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('Saturday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW());

INSERT INTO `groomer_working_hours` (`groomerCode`, `dayOfWeek`, `isWorking`, `startTime`, `endTime`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
VALUES
  ('G001', 'Sunday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G001', 'Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G001', 'Tuesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G001', 'Wednesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G001', 'Thursday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G001', 'Friday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G001', 'Saturday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', 'Sunday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', 'Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', 'Tuesday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', 'Wednesday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', 'Thursday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', 'Friday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', 'Saturday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', 'Sunday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', 'Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', 'Tuesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', 'Wednesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', 'Thursday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', 'Friday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', 'Saturday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW());

INSERT INTO `groomer_unavailability` (`groomerCode`, `startDate`, `endDate`, `startTime`, `endTime`, `reason`, `leaveType`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
VALUES
  ('G001', '2026-08-19', '2026-08-19', '12:00', '13:00', 'Lunch break', 'break', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('G002', '2026-08-20', '2026-08-20', '', '', 'Personal leave', 'leave', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()),
  ('B001', '2026-09-01', '2026-09-03', '', '', 'Vacation', 'leave', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW());
