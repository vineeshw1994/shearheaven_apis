import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class NotificationDeviceToken extends Model<
  InferAttributes<NotificationDeviceToken>,
  InferCreationAttributes<NotificationDeviceToken>
> {
  declare id: CreationOptional<number>;
  declare userId: CreationOptional<number | null>;
  declare groomerId: CreationOptional<number | null>;
  declare deviceId: string;
  declare pushToken: string;
  declare platform: CreationOptional<string>;
}

NotificationDeviceToken.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    groomerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    deviceId: { type: DataTypes.STRING(100), allowNull: false },
    pushToken: { type: DataTypes.STRING(500), allowNull: false },
    platform: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'android' },
  },
  {
    sequelize,
    tableName: 'notification_device_tokens',
    timestamps: true,
    indexes: [
      { unique: true, name: 'notif_device_token_unique', fields: ['deviceId', 'pushToken'] },
    ],
  }
);

export default NotificationDeviceToken;
