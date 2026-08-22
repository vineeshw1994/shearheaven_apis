import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
  declare id: CreationOptional<number>;
  declare userId: CreationOptional<number | null>;
  declare groomerId: CreationOptional<number | null>;
  declare title: string;
  declare message: string;
  declare type: CreationOptional<string>;
  declare data: CreationOptional<Record<string, unknown>>;
  declare isRead: CreationOptional<boolean>;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    groomerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'general' },
    data: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    clientId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    regionId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    storeId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['groomerId'] },
      { fields: ['isRead'] },
    ],
  }
);

export default Notification;
