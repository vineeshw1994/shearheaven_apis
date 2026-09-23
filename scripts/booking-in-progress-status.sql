-- Add in_progress to booking status flow (groomer start appointment)
-- Run once: mysql -u root -p shear_heaven < scripts/booking-in-progress-status.sql

ALTER TABLE `bookings`
  MODIFY COLUMN `status` ENUM(
    'pending',
    'confirmed',
    'in_progress',
    'cancelled',
    'completed',
    'cancellation_requested'
  ) NOT NULL DEFAULT 'pending';
