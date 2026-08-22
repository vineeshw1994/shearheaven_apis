-- Platform features migration (device login, notifications, discounts, offers, chat, CMS, groomer setup)
-- Tables are also auto-created on server startup via Sequelize ensureModels()

-- Run once on production if needed:
-- mysql -u root -p shear_heaven < scripts/platform-features-update.sql

-- Groomer one-time setup columns (if not applied by alignBookingFlowSchema)
ALTER TABLE `groomers`
  ADD COLUMN `mustChangePassword` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `tempLoginId` VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE `pending_signups`
  ADD COLUMN `deviceId` VARCHAR(100) NOT NULL DEFAULT '';
