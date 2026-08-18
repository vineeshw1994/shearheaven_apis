import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class Holiday extends Model<InferAttributes<Holiday>, InferCreationAttributes<Holiday>> {
  declare id: CreationOptional<number>;
  declare holidayCode: string;
  declare name: string;
  declare date: string;
  declare description: CreationOptional<string>;
  declare isStoreSpecific: CreationOptional<boolean>;
  declare clientId: string;
  declare regionId: string;
  declare storeId: string;
}

Holiday.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    holidayCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
    },
    isStoreSpecific: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'holiday_list',
    timestamps: true,
    indexes: [
      { fields: ['date'] },
      { fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default Holiday;
