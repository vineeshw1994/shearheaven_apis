import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class GroomerWorkingHour extends Model<
  InferAttributes<GroomerWorkingHour>,
  InferCreationAttributes<GroomerWorkingHour>
> {
  declare id: CreationOptional<number>;
  declare groomerId: number;
  declare dayOfWeek: string;
  declare isWorking: CreationOptional<boolean>;
  declare startTime: CreationOptional<string>;
  declare endTime: CreationOptional<string>;
  declare clientId: string;
  declare regionId: string;
  declare storeId: string;
}

GroomerWorkingHour.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    groomerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'groomers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    dayOfWeek: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    isWorking: {
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
    tableName: 'groomer_working_hours',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['groomerId', 'dayOfWeek'] },
      { fields: ['groomerId'] },
      { fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default GroomerWorkingHour;
