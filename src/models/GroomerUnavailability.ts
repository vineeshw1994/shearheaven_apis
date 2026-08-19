import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class GroomerUnavailability extends Model<
  InferAttributes<GroomerUnavailability>,
  InferCreationAttributes<GroomerUnavailability>
> {
  declare id: CreationOptional<number>;
  declare groomerCode: string;
  declare startDate: string;
  declare endDate: string;
  declare startTime: CreationOptional<string>;
  declare endTime: CreationOptional<string>;
  declare reason: CreationOptional<string>;
  declare leaveType: CreationOptional<'leave' | 'break' | 'unavailable' | 'other'>;
  declare clientId: string;
  declare regionId: string;
  declare storeId: string;
}

GroomerUnavailability.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    groomerCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
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
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    leaveType: {
      type: DataTypes.ENUM('leave', 'break', 'unavailable', 'other'),
      allowNull: false,
      defaultValue: 'unavailable',
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
    tableName: 'groomer_unavailability',
    timestamps: true,
    indexes: [
      { name: 'gunavail_groomer_code', fields: ['groomerCode'] },
      { name: 'gunavail_dates', fields: ['startDate', 'endDate'] },
      { name: 'gunavail_tenant', fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default GroomerUnavailability;
