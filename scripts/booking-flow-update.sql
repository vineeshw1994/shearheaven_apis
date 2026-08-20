-- Booking flow update: pending status, groomer auth, multi-booking, cancellation threshold
-- Run once: mysql -u root -p shear_heaven < scripts/booking-flow-update.sql

ALTER TABLE `groomers`
  ADD COLUMN `email` VARCHAR(255) NOT NULL DEFAULT '' AFTER `lastName`,
  ADD COLUMN `password` VARCHAR(255) NOT NULL DEFAULT '' AFTER `email`,
  ADD COLUMN `mobile` VARCHAR(20) NOT NULL DEFAULT '' AFTER `password`,
  ADD COLUMN `multiBookingEnabled` TINYINT(1) NOT NULL DEFAULT 0 AFTER `isActive`,
  ADD COLUMN `slotBookingLimit` INT UNSIGNED NOT NULL DEFAULT 1 AFTER `multiBookingEnabled`;

ALTER TABLE `store_master`
  ADD COLUMN `cancellationThresholdHours` INT UNSIGNED NOT NULL DEFAULT 3 AFTER `isActive`;

ALTER TABLE `bookings`
  MODIFY COLUMN `status` ENUM(
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'cancellation_requested'
  ) NOT NULL DEFAULT 'pending';

UPDATE `groomers`
SET `email` = CONCAT(LOWER(`groomerCode`), '@shearheaven.com')
WHERE `email` = '';
