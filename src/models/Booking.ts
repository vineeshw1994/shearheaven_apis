import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class Booking extends Model<InferAttributes<Booking>, InferCreationAttributes<Booking>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare petId: number;
  declare serviceId: number;
  declare packageId: CreationOptional<number | null>;
  declare addOnIds: CreationOptional<number[]>;
  declare groomerId: number;
  declare bookingDate: string;
  declare startTime: string;
  declare endTime: string;
  declare status: CreationOptional<string>;
  declare totalDurationMinutes: number;
  declare totalPrice: number;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    petId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'pets',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    serviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    packageId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    addOnIds: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    groomerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'confirmed',
    },
    totalDurationMinutes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    clientId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    regionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    storeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['petId'] },
      { fields: ['groomerId'] },
      { fields: ['bookingDate'] },
      { fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default Booking;
