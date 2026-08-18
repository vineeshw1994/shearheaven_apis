import User from './User';
import Pet from './Pet';
import Otp from './Otp';
import RefreshToken from './RefreshToken';
import PendingSignup from './PendingSignup';
import Booking from './Booking';
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

Groomer.hasMany(GroomerWorkingHour, { foreignKey: 'groomerId', as: 'workingHours' });
GroomerWorkingHour.belongsTo(Groomer, { foreignKey: 'groomerId', as: 'groomer' });

Groomer.hasMany(GroomerUnavailability, { foreignKey: 'groomerId', as: 'unavailability' });
GroomerUnavailability.belongsTo(Groomer, { foreignKey: 'groomerId', as: 'groomer' });

export {
  User,
  Pet,
  Otp,
  RefreshToken,
  PendingSignup,
  Booking,
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
  Groomer,
  Holiday,
  StoreOperationalHour,
  GroomerWorkingHour,
  GroomerUnavailability,
  syncModels,
};
