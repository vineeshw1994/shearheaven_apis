import User from './User';
import Pet from './Pet';
import Otp from './Otp';
import RefreshToken from './RefreshToken';
import PendingSignup from './PendingSignup';
import Booking from './Booking';

User.hasMany(Pet, { foreignKey: 'userId', as: 'pets' });
Pet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Pet.hasMany(Booking, { foreignKey: 'petId', as: 'bookings' });
Booking.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });

export { User, Pet, Otp, RefreshToken, PendingSignup, Booking };

export async function syncModels(force = false): Promise<void> {
  await User.sync({ force });
  await Pet.sync({ force });
  await Otp.sync({ force });
  await RefreshToken.sync({ force });
  await PendingSignup.sync({ force });
  await Booking.sync({ force });
}

/** Creates any missing tables without dropping existing data. */
export async function ensureModels(): Promise<void> {
  await User.sync();
  await Pet.sync();
  await Otp.sync();
  await RefreshToken.sync();
  await PendingSignup.sync();
  await Booking.sync();
}

export default { User, Pet, Otp, RefreshToken, PendingSignup, Booking, syncModels };
