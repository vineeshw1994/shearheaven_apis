import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type LoginUserType = 'guest' | 'registered' | 'admin' | 'groomer' | 'bather';

class LoginDevice extends Model<InferAttributes<LoginDevice>, InferCreationAttributes<LoginDevice>> {
  declare id: CreationOptional<number>;
  declare userId: CreationOptional<number | null>;
  declare userType: LoginUserType;
  declare deviceId: string;
  declare lastLoggedInAt: CreationOptional<Date>;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;
}

LoginDevice.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    userType: {
      type: DataTypes.ENUM('guest', 'registered', 'admin', 'groomer', 'bather'),
      allowNull: false,
      defaultValue: 'registered',
    },
    deviceId: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastLoggedInAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'login_devices',
    timestamps: true,
    indexes: [
      { name: 'login_devices_user', fields: ['userId', 'userType'] },
      { name: 'login_devices_device', fields: ['deviceId'] },
      { unique: true, name: 'login_devices_unique', fields: ['userId', 'userType', 'deviceId'] },
    ],
  }
);

export default LoginDevice;
