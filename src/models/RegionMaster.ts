import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class RegionMaster extends Model<InferAttributes<RegionMaster>, InferCreationAttributes<RegionMaster>> {
  declare id: CreationOptional<number>;
  declare regionId: string;
  declare clientId: string;
  declare name: string;
  declare isActive: CreationOptional<boolean>;
}

RegionMaster.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    regionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    clientId: {
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
    tableName: 'region_master',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['clientId', 'regionId'] },
      { fields: ['clientId'] },
    ],
  }
);

export default RegionMaster;
