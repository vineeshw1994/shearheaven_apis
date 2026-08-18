-- Shear Heaven - Schedule tables + sample data
-- Run on production MySQL after deploying the API code.
-- Database: shear_heaven (change USE if needed)

USE shear_heaven;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
-- 4. groomer_working_hours
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `groomer_working_hours` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `groomerId` INT UNSIGNED NOT NULL,
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
  UNIQUE KEY `groomer_hours_day_unique` (`groomerId`, `dayOfWeek`),
  KEY `groomer_working_hours_groomer_id` (`groomerId`),
  KEY `groomer_working_hours_client_id_region_id_store_id` (`clientId`, `regionId`, `storeId`),
  CONSTRAINT `groomer_working_hours_ibfk_1` FOREIGN KEY (`groomerId`) REFERENCES `groomers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- 5. groomer_unavailability
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `groomer_unavailability` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `groomerId` INT UNSIGNED NOT NULL,
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
  KEY `groomer_unavailability_groomer_id` (`groomerId`),
  KEY `groomer_unavailability_start_date_end_date` (`startDate`, `endDate`),
  KEY `groomer_unavailability_client_id_region_id_store_id` (`clientId`, `regionId`, `storeId`),
  CONSTRAINT `groomer_unavailability_ibfk_1` FOREIGN KEY (`groomerId`) REFERENCES `groomers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- SAMPLE DATA (from groomers.json + holidays.json)
-- Skip if tables already have data
-- ---------------------------------------------------------------------------

INSERT INTO `groomers` (`groomerCode`, `firstName`, `lastName`, `role`, `highlights`, `type`, `isActive`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
SELECT * FROM (
  SELECT 'G001', 'Merisa', 'Brown', 'Lead Groomer', 'Best lead groomer in town', 'Groomer', 1, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'G002', 'Richard', 'Cooke', 'Senior Groomer', 'Best groomer in town, got award in 2025!', 'Groomer', 1, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'B001', 'Jeremiah', 'Smith', 'Junio Bather', 'I am the best Bather', 'Bather', 1, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `groomers` LIMIT 1);

INSERT INTO `holiday_list` (`holidayCode`, `name`, `date`, `description`, `isStoreSpecific`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
SELECT * FROM (
  SELECT 'H001', 'Independence Day', '2026-07-04', 'Day of Independence', 0, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'H002', 'Easter', '2026-04-28', 'Day of Independence', 0, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'H003', 'Thanks giving day', '2026-11-25', 'Day of Independence', 0, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'H004', 'Christmas Day', '2026-12-25', 'Christmas Day', 0, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'H005', 'Store Maintenance', '2026-08-21', 'Store-specific closure for equipment maintenance', 1, 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `holiday_list` LIMIT 1);

INSERT INTO `store_operational_hours` (`dayOfWeek`, `isOpen`, `startTime`, `endTime`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
SELECT * FROM (
  SELECT 'Sunday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'Tuesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'Wednesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'Thursday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'Friday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 'Saturday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `store_operational_hours` LIMIT 1);

-- Groomer working hours (assumes groomer ids 1=G001, 2=G002, 3=B001)
INSERT INTO `groomer_working_hours` (`groomerId`, `dayOfWeek`, `isWorking`, `startTime`, `endTime`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
SELECT * FROM (
  SELECT 1, 'Sunday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 1, 'Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 1, 'Tuesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 1, 'Wednesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 1, 'Thursday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 1, 'Friday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 1, 'Saturday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 2, 'Sunday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 2, 'Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 2, 'Tuesday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 2, 'Wednesday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 2, 'Thursday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 2, 'Friday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 2, 'Saturday', 1, '10:00', '15:00', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 3, 'Sunday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 3, 'Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 3, 'Tuesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 3, 'Wednesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 3, 'Thursday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 3, 'Friday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 3, 'Saturday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `groomer_working_hours` LIMIT 1);

INSERT INTO `groomer_unavailability` (`groomerId`, `startDate`, `endDate`, `startTime`, `endTime`, `reason`, `leaveType`, `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`)
SELECT * FROM (
  SELECT 1, '2026-08-19', '2026-08-19', '12:00', '13:00', 'Lunch break', 'break', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 2, '2026-08-20', '2026-08-20', '', '', 'Personal leave', 'leave', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW() UNION ALL
  SELECT 3, '2026-09-01', '2026-09-03', '', '', 'Vacation', 'leave', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `groomer_unavailability` LIMIT 1);
