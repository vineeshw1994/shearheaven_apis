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
  declare groomerCode: string;
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
    groomerCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
      {
        unique: true,
        name: 'gwh_code_day_tenant_unique',
        fields: ['groomerCode', 'dayOfWeek', 'clientId', 'regionId', 'storeId'],
      },
      { name: 'gwh_groomer_code', fields: ['groomerCode'] },
      { name: 'gwh_tenant', fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default GroomerWorkingHour;
