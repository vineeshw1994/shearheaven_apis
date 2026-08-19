import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class StoreMaster extends Model<InferAttributes<StoreMaster>, InferCreationAttributes<StoreMaster>> {
  declare id: CreationOptional<number>;
  declare storeId: string;
  declare clientId: string;
  declare regionId: string;
  declare name: string;
  declare isActive: CreationOptional<boolean>;
}

StoreMaster.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    storeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    clientId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    regionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'store_master',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['storeId', 'clientId', 'regionId'] },
      { fields: ['clientId', 'regionId'] },
    ],
  }
);

export default StoreMaster;
