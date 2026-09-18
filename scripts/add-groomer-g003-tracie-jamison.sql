-- Add groomer G003 Tracie Jamison (safe to re-run if groomer already exists)

INSERT INTO `groomers` (
  `groomerCode`, `firstName`, `lastName`, `role`, `highlights`, `type`, `isActive`,
  `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`
)
SELECT
  'G003', 'Tracie', 'Jamison', 'Groomer', 'Experienced groomer with a gentle touch', 'Groomer', 1,
  'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `groomers`
  WHERE `groomerCode` = 'G003'
    AND `clientId` = 'SHEAR-001'
    AND `regionId` = 'DWG-001'
    AND `storeId` = 'SHEAR-001'
);

INSERT INTO `groomer_working_hours` (
  `groomerCode`, `dayOfWeek`, `isWorking`, `startTime`, `endTime`,
  `clientId`, `regionId`, `storeId`, `createdAt`, `updatedAt`
)
SELECT * FROM (
  SELECT 'G003' AS groomerCode, 'Sunday' AS dayOfWeek, 0 AS isWorking, '' AS startTime, '' AS endTime, 'SHEAR-001' AS clientId, 'DWG-001' AS regionId, 'SHEAR-001' AS storeId, NOW() AS createdAt, NOW() AS updatedAt
  UNION ALL SELECT 'G003', 'Monday', 0, '', '', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
  UNION ALL SELECT 'G003', 'Tuesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
  UNION ALL SELECT 'G003', 'Wednesday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
  UNION ALL SELECT 'G003', 'Thursday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
  UNION ALL SELECT 'G003', 'Friday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
  UNION ALL SELECT 'G003', 'Saturday', 1, '08:00', '17:30', 'SHEAR-001', 'DWG-001', 'SHEAR-001', NOW(), NOW()
) AS seed_hours
WHERE NOT EXISTS (
  SELECT 1 FROM `groomer_working_hours`
  WHERE `groomerCode` = 'G003'
    AND `clientId` = 'SHEAR-001'
    AND `regionId` = 'DWG-001'
    AND `storeId` = 'SHEAR-001'
);

-- Optional: set login email for groomer auth (matches booking-flow-update pattern)
UPDATE `groomers`
SET `email` = 'g003@shearheaven.com'
WHERE `groomerCode` = 'G003'
  AND `clientId` = 'SHEAR-001'
  AND `regionId` = 'DWG-001'
  AND `storeId` = 'SHEAR-001'
  AND (`email` IS NULL OR `email` = '');
