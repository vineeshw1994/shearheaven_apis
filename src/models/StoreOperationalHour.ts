import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class StoreOperationalHour extends Model<
  InferAttributes<StoreOperationalHour>,
  InferCreationAttributes<StoreOperationalHour>
> {
  declare id: CreationOptional<number>;
  declare dayOfWeek: string;
  declare isOpen: CreationOptional<boolean>;
  declare startTime: CreationOptional<string>;
  declare endTime: CreationOptional<string>;
  declare clientId: string;
  declare regionId: string;
  declare storeId: string;
}

StoreOperationalHour.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    dayOfWeek: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    startTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: '',
    },
    endTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: '',
    },
    clientId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    regionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    storeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'store_operational_hours',
    timestamps: true,
    indexes: [
      {
        unique: true,
        name: 'soh_day_tenant_unique',
        fields: ['dayOfWeek', 'clientId', 'regionId', 'storeId'],
      },
      { name: 'soh_tenant', fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default StoreOperationalHour;
