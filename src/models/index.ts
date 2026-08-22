import User from './User';
import Pet from './Pet';
import Otp from './Otp';
import RefreshToken from './RefreshToken';
import PendingSignup from './PendingSignup';
import Booking from './Booking';
import ClientMaster from './ClientMaster';
import RegionMaster from './RegionMaster';
import StoreMaster from './StoreMaster';
import Groomer from './Groomer';
import GroomerRefreshToken from './GroomerRefreshToken';
import Holiday from './Holiday';
import StoreOperationalHour from './StoreOperationalHour';
import GroomerWorkingHour from './GroomerWorkingHour';
import GroomerUnavailability from './GroomerUnavailability';
import LoginDevice from './LoginDevice';
import Discount from './Discount';
import Notification from './Notification';
import NotificationDeviceToken from './NotificationDeviceToken';
import Offer from './Offer';
import ChatMessage from './ChatMessage';
import StoreContent from './StoreContent';

User.hasMany(Pet, { foreignKey: 'userId', as: 'pets' });
Pet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(LoginDevice, { foreignKey: 'userId', as: 'loginDevices' });
LoginDevice.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Groomer.hasMany(GroomerRefreshToken, { foreignKey: 'groomerId', as: 'refreshTokens' });
GroomerRefreshToken.belongsTo(Groomer, { foreignKey: 'groomerId', as: 'groomer' });

Groomer.hasMany(Notification, { foreignKey: 'groomerId', as: 'notifications' });
Notification.belongsTo(Groomer, { foreignKey: 'groomerId', as: 'groomer' });

Pet.hasMany(Booking, { foreignKey: 'petId', as: 'bookings' });
Booking.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });

ClientMaster.hasMany(RegionMaster, { foreignKey: 'clientId', sourceKey: 'clientId', as: 'regions' });
RegionMaster.belongsTo(ClientMaster, { foreignKey: 'clientId', targetKey: 'clientId', as: 'client' });

ClientMaster.hasMany(StoreMaster, { foreignKey: 'clientId', sourceKey: 'clientId', as: 'stores' });
StoreMaster.belongsTo(ClientMaster, { foreignKey: 'clientId', targetKey: 'clientId', as: 'client' });

const platformModels = [
  User,
  Pet,
  Otp,
  RefreshToken,
  PendingSignup,
  Booking,
  ClientMaster,
  RegionMaster,
  StoreMaster,
  Groomer,
  GroomerRefreshToken,
  Holiday,
  StoreOperationalHour,
  GroomerWorkingHour,
  GroomerUnavailability,
  LoginDevice,
  Discount,
  Notification,
  NotificationDeviceToken,
  Offer,
  ChatMessage,
  StoreContent,
];

export {
  User,
  Pet,
  Otp,
  RefreshToken,
  PendingSignup,
  Booking,
  ClientMaster,
  RegionMaster,
  StoreMaster,
  Groomer,
  GroomerRefreshToken,
  Holiday,
  StoreOperationalHour,
  GroomerWorkingHour,
  GroomerUnavailability,
  LoginDevice,
  Discount,
  Notification,
  NotificationDeviceToken,
  Offer,
  ChatMessage,
  StoreContent,
};

export async function syncModels(force = false): Promise<void> {
  for (const model of platformModels) {
    await model.sync({ force });
  }
}

export async function ensureModels(): Promise<void> {
  for (const model of platformModels) {
    await model.sync();
  }
}

export default {
  User,
  Pet,
  Otp,
  RefreshToken,
  PendingSignup,
  Booking,
  ClientMaster,
  RegionMaster,
  StoreMaster,
  Groomer,
  GroomerRefreshToken,
  Holiday,
  StoreOperationalHour,
  GroomerWorkingHour,
  GroomerUnavailability,
  LoginDevice,
  Discount,
  Notification,
  NotificationDeviceToken,
  Offer,
  ChatMessage,
  StoreContent,
  syncModels,
};
