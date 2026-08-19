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
import Holiday from './Holiday';
import StoreOperationalHour from './StoreOperationalHour';
import GroomerWorkingHour from './GroomerWorkingHour';
import GroomerUnavailability from './GroomerUnavailability';

User.hasMany(Pet, { foreignKey: 'userId', as: 'pets' });
Pet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Pet.hasMany(Booking, { foreignKey: 'petId', as: 'bookings' });
Booking.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });

ClientMaster.hasMany(RegionMaster, { foreignKey: 'clientId', sourceKey: 'clientId', as: 'regions' });
RegionMaster.belongsTo(ClientMaster, { foreignKey: 'clientId', targetKey: 'clientId', as: 'client' });

ClientMaster.hasMany(StoreMaster, { foreignKey: 'clientId', sourceKey: 'clientId', as: 'stores' });
StoreMaster.belongsTo(ClientMaster, { foreignKey: 'clientId', targetKey: 'clientId', as: 'client' });

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
  Holiday,
  StoreOperationalHour,
  GroomerWorkingHour,
  GroomerUnavailability,
};

export async function syncModels(force = false): Promise<void> {
  await User.sync({ force });
  await Pet.sync({ force });
  await Otp.sync({ force });
  await RefreshToken.sync({ force });
  await PendingSignup.sync({ force });
  await Booking.sync({ force });
  await ClientMaster.sync({ force });
  await RegionMaster.sync({ force });
  await StoreMaster.sync({ force });
  await Groomer.sync({ force });
  await Holiday.sync({ force });
  await StoreOperationalHour.sync({ force });
  await GroomerWorkingHour.sync({ force });
  await GroomerUnavailability.sync({ force });
}

/** Creates any missing tables without dropping existing data. */
export async function ensureModels(): Promise<void> {
  await User.sync();
  await Pet.sync();
  await Otp.sync();
  await RefreshToken.sync();
  await PendingSignup.sync();
  await Booking.sync();
  await ClientMaster.sync();
  await RegionMaster.sync();
  await StoreMaster.sync();
  await Groomer.sync();
  await Holiday.sync();
  await StoreOperationalHour.sync();
  await GroomerWorkingHour.sync();
  await GroomerUnavailability.sync();
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
  Holiday,
  StoreOperationalHour,
  GroomerWorkingHour,
  GroomerUnavailability,
  syncModels,
};
